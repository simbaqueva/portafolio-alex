#!/usr/bin/env python3
"""
Sube TODO el portafolio a Cloudinary replicando EXACTO la estructura local.

- Carpeta raiz: la parent de scripts/ (raiz del proyecto)
- Se recorren: 01_BRANDING_IDENTITY, 02_SOCIAL_MEDIA_DIGITAL,
  03_BTL_POP_MATERIALES y "Comerciales tv"
- El public_id = ruta relativa (con '/') del archivo sin extension,
  por lo que Cloudinary crea las mismas carpetas tal cual.
- Tipos: jpg/jpeg/png/webp/gif -> image | mp4/mov/webm -> video | pdf/tif -> raw

Uso:
    python upload_to_cloudinary.py                  # usa variables de entorno
    python upload_to_cloudinary.py --dry-run        # solo lista, no sube
"""

import os
import sys
import argparse
from pathlib import Path

# Forzar salida UTF-8 en consolas Windows (evita UnicodeEncodeError)
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import cloudinary
import cloudinary.uploader

# Raiz del proyecto (padre de scripts/)
BASE = Path(__file__).resolve().parent.parent

# Carga automatica del archivo .env de la raiz del proyecto (si existe)
try:
    from dotenv import load_dotenv
    load_dotenv(BASE / ".env")
except Exception:
    pass

# Categorias de nivel superior que se subirán
TOP_LEVEL = [
    "01_BRANDING_IDENTITY",
    "02_SOCIAL_MEDIA_DIGITAL",
    "03_BTL_POP_MATERIALES",
    "Comerciales tv",
]

# Extensiones ignoradas (archivos propios de Windows / backups)
IGNORE_EXTS = {".ini", ".db", ".backup", ".tmp", ".DS_Store"}
# Extensiones que mas para nada no se suben (no media)
SKIP_PATTERNS = ("desktop.ini",)


def classify(ext):
    """Devuelve el resource_type de Cloudinary segun la extension."""
    e = ext.lower()
    if e in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
        return "image"
    if e in (".mp4", ".mov", ".webm", ".avi", ".mkv", ".m4v"):
        return "video"
    return "raw"  # pdf, tiff, svg, psd, ai, etc.


def build_relative_path(root, file_path):
    """Ruta relativa del archivo respecto a raiz con separadores '/'."""
    rel = file_path.relative_to(root)
    return str(rel).replace(os.sep, "/")


def iter_files(root):
    """Recorre las categorias listadas y entrega (path_rel, file_path)."""
    for cat in TOP_LEVEL:
        cat_path = root / cat
        if not cat_path.is_dir():
            print(f"⚠️  Carpeta no encontrada, se omite: {cat}")
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
                file_path = Path(dirpath) / name
                yield build_relative_path(root, file_path), file_path


def main():
    parser = argparse.ArgumentParser(description="Sube el portafolio a Cloudinary.")
    parser.add_argument("--dry-run", action="store_true",
                        help="Solo muestra lo que subiria, sin subir nada.")
    parser.add_argument("--cloud-name", default=os.getenv("CLOUDINARY_CLOUD_NAME"))
    parser.add_argument("--api-key", default=os.getenv("CLOUDINARY_API_KEY"))
    parser.add_argument("--api-secret", default=os.getenv("CLOUDINARY_API_SECRET"))
    args = parser.parse_args()

    if not args.cloud_name or not args.api_key or not args.api_secret:
        if not args.dry_run:
            print("❌ Faltan credenciales. Define en tu .env o variables de entorno:")
            print("   CLOUDINARY_CLOUD_NAME")
            print("   CLOUDINARY_API_KEY")
            print("   CLOUDINARY_API_SECRET")
            sys.exit(1)

    if not args.dry_run:
        cloudinary.config(
            cloud_name=args.cloud_name,
            api_key=args.api_key,
            api_secret=args.api_secret,
            secure=True,
        )

    files = list(iter_files(BASE))
    print(f"📦 Se procesarán {len(files)} archivos\n")

    uploaded = 0
    failed = 0

    for rel, path in files:
        ext = path.suffix
        rtype = classify(ext)
        # public_id = ruta relativa sin extension (replica estructura)
        public_id = Path(rel).with_suffix("").as_posix()

        if args.dry_run:
            print(f"  [dry-run] {rtype:5s} -> {public_id}  (archivo: {rel})")
            continue

        try:
            result = cloudinary.uploader.upload(
                str(path),
                public_id=public_id,
                resource_type=rtype,
                overwrite=False,
                use_filename=False,
                unique_filename=False,
            )
            print(f"  ✓ {rtype:5s} {rel}  ->  {result.get('secure_url', '')}")
            uploaded += 1
        except Exception as e:
            print(f"  ✗ FALLO  {rel}  ->  {e}")
            failed += 1

    print("\n" + "=" * 60)
    print(f"RESUMEN: {uploaded} subidos | {failed} fallidos | {len(files)} totales")
    print("=" * 60)


if __name__ == "__main__":
    main()