#!/usr/bin/env python3
"""
Comprime los recursos pendientes que exceden los limites de Cloudinary
(imagen/raw > 10 MB, video > 100 MB) y los sube de nuevo preservando la
estructura de carpetas (public_id = ruta relativa sin extension).

Estrategia por tipo:
  - png / tif / jpg -> JPEG de alta calidad (quality ~88). Si aun supera
    el limite, se reduce progresivamente la dimension y la calidad.
  - pdf -> se re-renderizan las paginas a JPEG (150-200 DPI) y se reconstruye
    un PDF comprimido, ajustando para quedar por debajo del limite.
  - mp4 / mov / webm -> re-encode H.264 (crf ~24); si supera el limite,
    se sube el crf y/o se reduce la resolucion.

Salida temporal en  <raiz>/_compressed/<misma ruta>  y subida con el mismo
public_id (sin extension). Luego opcionalmente --keep para no borrar origenes.

Uso:
  python compress_upload.py --dry-run        # lista pendientes a comprimir
  python compress_upload.py                  # comprime y sube los pendientes
"""
import os
import sys
import re
import json
import shutil
import argparse
import subprocess
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

from dotenv import load_dotenv
import cloudinary
import cloudinary.api
import cloudinary.uploader

from PIL import Image

BASE = Path(__file__).resolve().parent.parent
load_dotenv(BASE / ".env")

TOP_LEVEL = [
    "01_BRANDING_IDENTITY",
    "02_SOCIAL_MEDIA_DIGITAL",
    "03_BTL_POP_MATERIALES",
    "Comerciales tv",
]

# Limites de la cuenta (con margen de seguridad)
IMG_LIMIT = 8_000_000      # imagenes/Otros por debajo de 10 MB
VIDEO_LIMIT = 90_000_000   # videos por debajo de 100 MB

FFMPEG = None

IGNORE_EXTS = {".ini", ".db", ".backup", ".tmp", ".DS_Store"}
SKIP_PATTERNS = ("desktop.ini",)
CHUNK_SIZE = 6_000_000


def get_ffmpeg():
    global FFMPEG
    if FFMPEG is None:
        import imageio_ffmpeg
        FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
    return FFMPEG


def classify(ext):
    e = ext.lower()
    if e in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".tif", ".tiff"):
        return "image"
    if e in (".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"):
        return "video"
    return "raw"


def all_local_files(root=None):
    root = root or BASE
    out = []
    for cat in TOP_LEVEL:
        cp = root / cat
        if not cp.is_dir():
            continue
        for dp, dn, fn in os.walk(cp):
            dn.sort()
            for name in sorted(fn):
                if name.startswith("."):
                    continue
                if Path(name).suffix.lower() in IGNORE_EXTS:
                    continue
                if name.lower() in SKIP_PATTERNS:
                    continue
                fp = Path(dp) / name
                rel = fp.relative_to(root).as_posix()
                out.append((rel, fp))
    return out


def existing_ids():
    ids = set()
    for rtype in ("image", "video", "raw"):
        cursor = None
        while True:
            params = {"resource_type": rtype, "max_results": 500}
            if cursor:
                params["next_cursor"] = cursor
            res = cloudinary.api.resources(**params)
            for it in res.get("resources", []):
                pid = it.get("public_id", "")
                if pid:
                    ids.add(pid)
                    ids.add(pid + Path(pid).suffix)
            cursor = res.get("next_cursor")
            if not cursor:
                break
    return ids


def pendientes(files, existing):
    """Devuelve (rel, fp, rtype, public_id) de archivos que superan el limite
    y no existen en Cloudinary."""
    out = []
    for rel, fp in files:
        rtype = classify(fp.suffix)
        limit = VIDEO_LIMIT if rtype == "video" else IMG_LIMIT
        if fp.stat().st_size <= limit:
            continue
        pid = Path(rel).with_suffix("").as_posix()
        pid_ext = pid + fp.suffix.lower()
        if pid in existing or pid_ext in existing:
            continue
        out.append((rel, fp, rtype, pid))
    return out
def compress_image(src, dst, limit):
    """Comprime un png/tif/jpg a JPEG reduciendo calidad/dimension hasta <= limit."""
    img = Image.open(src)
    if img.mode in ("RGBA", "LA", "P"):
        rgba = img.convert("RGBA")
        bg = Image.new("RGB", rgba.size, (255, 255, 255))
        bg.paste(rgba, mask=rgba.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")

    quality = 90
    max_side = 4000
    if max(img.size) > max_side:
        img.thumbnail((max_side, max_side), Image.LANCZOS)

    while True:
        fp_tmp = dst.with_suffix(".q.jpg")
        img.save(fp_tmp, "JPEG", quality=quality, optimize=True, progressive=True)
        size = fp_tmp.stat().st_size
        if size <= limit or quality <= 45 or max(img.size) <= 1600:
            if size <= limit:
                shutil.move(str(fp_tmp), str(dst))
            else:
                fp_tmp.unlink(missing_ok=True)
                return size
            return size
        if size > limit * 1.5 and max(img.size) > 2000:
            img.thumbnail((max(img.size) * 3 // 4,) * 2, Image.LANCZOS)
        else:
            quality -= 5
    return limit


def compress_pdf(src, dst, limit):
    """Re-renderiza el PDF, codifica cada pagina a JPEG y lo re-ensambla."""
    import pymupdf

    results = []
    # (dpi, calidad_jpeg)
    plans = [(150, 82), (120, 80), (100, 78), (90, 75), (75, 72), (60, 70)]
    for dpi, q in plans:
        doc = pymupdf.open(src)
        matrix = pymupdf.Matrix(dpi / 72, dpi / 72)
        jpegs = []  # (width_px, height_px, jpeg_bytes)
        for page in doc:
            pix = page.get_pixmap(matrix=matrix, alpha=False)
            w, h = pix.width, pix.height
            if pix.n > 3:
                pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            data = pix.tobytes("jpeg", jpg_quality=q)
            jpegs.append((w, h, data))
        doc.close()

        out = pymupdf.open()
        for w, h, data in jpegs:
            page = out.new_page(width=w, height=h)
            page.insert_image(page.rect, stream=data, overlay=True)
        tmp = dst.with_suffix(f".{dpi}.pdf")
        out.save(tmp, garbage=4, deflate=True)
        out.close()
        size = tmp.stat().st_size
        if size <= limit:
            shutil.move(str(tmp), str(dst))
            return size
        results.append((size, tmp))
    results.sort(key=lambda x: x[0])
    best_size, best_path = results[0]
    for s, p in results[1:]:
        p.unlink(missing_ok=True)
    shutil.move(str(best_path), str(dst))
    return best_size


def compress_video(src, dst, limit, ffmpeg):
    """Re-encode del video con H.264 (crf ~24) y, si hace falta, baja resolucion."""
    probe = subprocess.run(
        [ffmpeg, "-i", str(src)],
        capture_output=True, text=True, shell=True)
    info = (probe.stderr or "") + (probe.stdout or "")
    m_dur = re.search(r"Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)", info)
    dur_s = None
    if m_dur:
        h, mm, s = m_dur.groups()
        dur_s = int(h) * 3600 + int(mm) * 60 + float(s)
    m_res = re.search(r"(\d{3,5})x(\d{3,5})", info)
    width = int(m_res.group(1)) if m_res else 1920
    height = int(m_res.group(2)) if m_res else 1080

    base_video_size = max(2_000_000, int(dur_s)) if dur_s else 20_000_000
    bitrate = int(limit * 0.85 * 8 / base_video_size) if dur_s else 8_000_000

    def _run(args):
        return subprocess.run(args, shell=True, capture_output=True, text=True)

    args = [
        ffmpeg, "-y", "-i", str(src),
        "-c:v", "libx264", "-preset", "medium", "-crf", "24",
        "-b:v", f"{bitrate}", "-maxrate", f"{int(bitrate*1.2)}",
        "-bufsize", f"{int(bitrate*2)}",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        "-movflags", "+faststart", "-loglevel", "error",
    ]
    if max(width, height) > 1920 and limit >= 90_000_000:
        args += ["-vf", "scale='min(1920,iw)':-2"]
    args += [str(dst)]

    r = _run(args)
    if r.returncode != 0:
        raise RuntimeError("ffmpeg fallo: " + (r.stderr or "")[-2000:])

    size = dst.stat().st_size
    if size <= limit:
        return size
    dst2 = dst.with_suffix(".v2.mp4")
    args2 = [
        ffmpeg, "-y", "-i", str(src),
        "-vf", "scale='min(1280,iw)':-2",
        "-c:v", "libx264", "-preset", "medium", "-crf", "26",
        "-b:v", f"{int(bitrate*0.7)}", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart",
        "-loglevel", "error", str(dst2),
    ]
    r2 = _run(args2)
    size2 = dst2.stat().st_size if dst2.exists() else 0
    if r2.returncode == 0 and size2 <= limit:
        shutil.move(str(dst2), str(dst))
        return size2
    return size
def upload_one(fp, public_id, rtype):
    opts = dict(public_id=public_id, resource_type=rtype,
                overwrite=True, use_filename=False, unique_filename=False)
    if rtype == "video" and fp.stat().st_size > 10_000_000:
        return cloudinary.uploader.upload_large(
            str(fp), chunk_size=CHUNK_SIZE, **opts)
    return cloudinary.uploader.upload(str(fp), **opts)


def human(n):
    return f"{n/1_000_000:.1f}MB"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true",
                        help="Solo lista que se comprimiria/subiria.")
    parser.add_argument("--compress-only", action="store_true",
                        help="Comprime a _compressed pero no sube.")
    parser.add_argument("--kind", choices=["image", "video", "raw"],
                        help="Procesar solo un tipo de recurso.")
    args = parser.parse_args()

    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True)

    files = all_local_files()
    existing = existing_ids()
    pend = pendientes(files, existing)
    if args.kind:
        pend = [p for p in pend if p[2] == args.kind]

    print(f"📦 Pendientes grandes por comprimir/subir: {len(pend)}")
    if args.dry_run:
        for rel, fp, rt, pid in pend:
            print(f"  {rt:6s} {human(fp.stat().st_size):>11}  {rel}")
        return

    out_root = BASE / "_compressed"
    ffmpeg = get_ffmpeg()
    done, failed = 0, 0
    mapping = {}

    for rel, fp, rt, pid in pend:
        limit = VIDEO_LIMIT if rt == "video" else IMG_LIMIT
        rel_ext = Path(rel)
        if rt == "video":
            out_rel = rel_ext.with_suffix(".mp4")
        elif rt == "image":
            out_rel = rel_ext.with_suffix(".jpg")
        else:
            out_rel = rel_ext.with_suffix(".pdf")
        out_path = out_root / out_rel
        out_path.parent.mkdir(parents=True, exist_ok=True)
        orig = fp.stat().st_size

        try:
            if rt == "video":
                size = compress_video(fp, out_path, limit, ffmpeg)
            elif rt == "image":
                size = compress_image(fp, out_path, limit)
            else:
                size = compress_pdf(fp, out_path, limit)
            print(f"  ✓ {rt:6s} {rel}")
            print(f"       {human(orig)} -> {human(size)}  (limite {human(limit)})")

            if args.compress_only:
                continue

            res = upload_one(out_path, pid, rt)
            url = res.get("secure_url")
            mapping[pid] = url
            print(f"       subido: {url}")
            done += 1
        except Exception as e:
            print(f"  ✗ {rt:6s} {rel} -> {e}")
            failed += 1

    if mapping:
        _save_mapping(mapping, BASE / "data" / "cloudinary-url-map.json",
                      updat=True)

    print("\n" + "=" * 60)
    print(f"RESUMEN: {done} subidos | {failed} fallidos | {len(pend)} totales")
    print("=" * 60)


def _save_mapping(mapping, dest, updat=False):
    if dest.exists() and updat:
        try:
            prev = json.loads(dest.read_text(encoding="utf-8"))
            prev.update(mapping)
            mapping = prev
        except Exception:
            pass
    dest.write_text(json.dumps(mapping, ensure_ascii=False, indent=2),
                    encoding="utf-8")
    print(f"💾 Mapeo actualizado: {dest} ({len(mapping)} entradas)")


if __name__ == "__main__":
    main()