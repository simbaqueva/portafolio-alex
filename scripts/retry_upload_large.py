#!/usr/bin/env python3
"""
Reintenta los archivos que quedaron pendientes en Cloudinary usando carga 'chunked' (upload_large).

Solo procesa archivos que NO existen aun en Cloudinary (evita duplicar los 419 ya subidos).
Sirve para archivos grandes (>10 MB) que la subida sincrona no pudo cargar.

Uso:
    python retry_upload_large.py --dry-run   # lista pendientes sin subir
    python retry_upload_large.py              # sube lo que falta
"""

import os
import sys
import time
import argparse
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import cloudinary
import cloudinary.api
import cloudinary.uploader
from cloudinary.exceptions import NotFound

# Raiz del proyecto
BASE = Path(__file__).resolve().parent.parent

try:
    from dotenv import load_dotenv
    load_dotenv(BASE / ".env")
except Exception:
    pass

TOP_LEVEL = [
    "01_BRANDING_IDENTITY",
    "02_SOCIAL_MEDIA_DIGITAL",
    "03_BTL_POP_MATERIALES",
    "Comerciales tv",
]
IGNORE_EXTS = {".ini", ".db", ".backup", ".tmp", ".DS_Store"}
SKIP_PATTERNS = ("desktop.ini",)
CHUNK_SIZE = 20_000_000  # 20 MB por bloque (minimo recomendado por Cloudinary)
MAX_ATTEMPTS = 3


def classify(ext):
    e = ext.lower()
    if e in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
        return "image"
    if e in (".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"):
        return "video"
    return "raw"  # pdf, tiff, svg, psd, etc.


def all_files(root=None):
    """Recorre las categorias y entrega (rel, file_path). usa BASE si no se da root."""
    root = root or BASE
    out = []
    for cat in TOP_LEVEL:
        cat_path = root / cat
        if not cat_path.is_dir():
            continue
        for dirpath, dirnames, filenames in os.walk(cat_path):
            dirnames.sort()
            for name in sorted(filenames):
                if name.startswith("."):
                    continue
                if Path(name).suffix.lower() in IGNORE_EXTS:
                    continue
                if name.lower() in SKIP_PATTERNS:
                    continue
                fp = Path(dirpath) / name
                rel = fp.relative_to(root).as_posix()
                out.append((rel, fp))
    return out


def _all_existing_ids():
    """Devuelve el conjunto de public_ids ya subidos, listando por lotes (pocas llamadas)."""
    ids = set()
    for rtype in ("image", "video", "raw"):
        next_cursor = None
        while True:
            params = {"resource_type": rtype, "max_results": 500}
            if next_cursor:
                params["next_cursor"] = next_cursor
            res = cloudinary.api.resources(**params)
            for item in res.get("resources", []):
                pid = item.get("public_id", "")
                if pid:
                    ids.add(pid)
            next_cursor = res.get("next_cursor")
            if not next_cursor:
                break
    return ids


def build_pendientes(files, existing_ids):
    """Devuelve las tuplas (rel, fp, rtype, public_id) que faltan por subir."""
    pend = []
    for rel, fp in files:
        rtype = classify(fp.suffix)
        public_id = Path(rel).with_suffix("").as_posix()
        # Para raw/video Cloudinary puede guardar la extension en el id.
        candidates = {public_id, public_id + fp.suffix.lower()}
        if candidates.isdisjoint(existing_ids):
            pend.append((rel, fp, rtype, public_id))
    return pend


def upload_large_with_retry(path, public_id, rtype):
    last = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            return cloudinary.uploader.upload_large(
                str(path),
                public_id=public_id,
                resource_type=rtype,
                chunk_size=CHUNK_SIZE,
                overwrite=True,
                use_filename=False,
                unique_filename=False,
            )
        except Exception as e:
            last = e
            print(f"     intento {attempt}/{MAX_ATTEMPTS} fallo: {e}")
    raise last


def main():
    parser = argparse.ArgumentParser(description="Sube pendientes con carga chunked.")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--cloud-name", default=os.getenv("CLOUDINARY_CLOUD_NAME"))
    parser.add_argument("--api-key", default=os.getenv("CLOUDINARY_API_KEY"))
    parser.add_argument("--api-secret", default=os.getenv("CLOUDINARY_API_SECRET"))
    args = parser.parse_args()

    if not (args.cloud_name and args.api_key and args.api_secret) and not args.dry_run:
        print("❌ Faltan credenciales en el .env")
        sys.exit(1)

    if not args.dry_run:
        cloudinary.config(
            cloud_name=args.cloud_name,
            api_key=args.api_key,
            api_secret=args.api_secret,
            secure=True,
        )

    files = all_files()  # usa BASE por defecto

    # Listar lo ya subido con pocas llamadas (en lugar de 448 individuales)
    existing_ids = _all_existing_ids() if not args.dry_run else set()
    pendientes = build_pendientes(files, existing_ids)

    print(f"📦 Script proceso: {len(files)} archivos | pendientes por subir: {len(pendientes)}\n")

    if args.dry_run:
        for rel, fp, rt, pid in pendientes:
            print(f"  [dry-run] {rt:5s} {rel}")
        return

    subidos, fallidos = 0, 0
    for rel, fp, rt, pid in pendientes:
        try:
            res = upload_large_with_retry(fp, pid, rt)
            print(f"  ✅ {rt:5s} {rel}  ->  {res.get('secure_url', '')}")
            subidos += 1
        except Exception as e:
            print(f"  ❌ {rt:5s} {rel}  ->  {e}")
            fallidos += 1

    print("\n" + "=" * 60)
    print(f"RESUMEN RETRY: {subidos} subidos | {fallidos} fallidos | {len(pendientes)} pendientes")
    print("=" * 60)


if __name__ == "__main__":
    main()