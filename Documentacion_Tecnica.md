# 📘 Documentación Técnica
> Para desarrolladores, mantenedores y administradores del repositorio.

---

## 1. Arquitectura general

- **Frontend:** HTML5 + CSS3 + JavaScript (Vanilla JS, sin frameworks)
- **Estático:** la web se sirve como archivos estáticos (ideal para **GitHub Pages**)
- **CDN de recursos:** todos los assets (imágenes, videos, PDFs) se sirven desde **Cloudinary** (`https://res.cloudinary.com/bejbzt7n/...`)
- **Fuente de datos:** `data/portfolio-manifest.json` — contiene los metadatos de los 63 proyectos y las URLs de Cloudinary

---

## 2. Estructura de datos: `portfolio-manifest.json`

```json
{
  "categories": [
    {
      "label": "Branding",
      "key": "01_branding_identity",
      "projects": [
        {
          "title": "Nombre del proyecto",
          "subtitle": "...",
          "badge": "...",
          "previewImage": "https://res.cloudinary.com/.../preview.jpg",
          "assets": [
            {
              "type": "image" | "video" | "document" | "website",
              "format": "pdf",
              "src": "https://res.cloudinary.com/.../archivo.png",
              "title": "Nombre descriptivo"
            }
          ],
          "tags": [...],
          "category": "..."
        }
      ]
    }
  ]
}
```

| Campo | Descripción |
|---|---|
| `type: "image"` | Imagen → se abre en lightbox |
| `type: "video"` | Video → se reproduce en reproductor overlay |
| `type: "document"` (`format: "pdf"`) | PDF → se abre en modal |
| `type: "website"` | Sitio web → abre enlace externo |

---

## 3. Sistema de subida a Cloudinary

### 3.1 Credenciales

Archivo `.env` (ignorado por Git):
```
CLOUDINARY_CLOUD_NAME=bejbzt7n
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Plantilla segura: `.env.example`

### 3.2 Scripts disponibles

| Script | Propósito |
|---|---|
| `scripts/upload_to_cloudinary.py` | Subida directa de un archivo o carpeta a Cloudinary |
| `scripts/compress_upload.py` | Comprime (PDF/Video/Imagenes) y sube manteniendo la ruta |
| `scripts/retry_upload_large.py` | Reintenta subidas fallidas de archivos grandes |

### 3.3 Convención de `public_id`

Cloudinary usa la **ruta relativa del archivo** como `public_id`:
```
01_BRANDING_IDENTITY/A_Mimir/01_Logo/logo.png
→ https://res.cloudinary.com/bejbzt7n/image/upload/v1787857661/01_BRANDING_IDENTITY/A_Mimir/01_Logo/logo.png
```

---

## 4. Frontend: cómo funciona la web

### 4.1 `index.html`
- Estructura semántica: header → hero → portfolio (categories) → lightbox → PDF modal → footer
- El contenido se renderiza dinámicamente con JS (el HTML es un esqueleto)
- El PDF modal (`#pdfModal`) se activa con la clase `.active`

### 4.2 `js/main.js`
- Renderiza proyectos desde `portfolioData` (embebido o cargado)
- Detecta tipo de asset:
  - `image` → lightbox (`<img>`)
  - `video` → reproductor con overlay play
  - `document` (PDF) → abre modal PDF
  - `website` → abre `target="_blank"`
- Eventos: clic en asset, cerrar modal (X, backdrop, Escape)

### 4.3 `css/style.css`
- Variables CSS: `--bg`, `--text`, `--accent`, etc.
- Glassmorphism en cards y modal
- Responsive: media queries en 768px, 1024px, 1440px
- Keyframes: `fadeInDown`, `pulse`, `float`

---

## 5. Cómo contribuir / mantener

### 5.1 Agregar un nuevo recurso
1. Coloca el archivo en la carpeta local correspondiente
2. Corre:
```bash
python scripts/compress_upload.py
python scripts/upload_to_cloudinary.py "ruta/del/archivo.ext"
```
3. Verifica que aparezca en `data/cloudinary-url-map.json`
4. Referencia la URL en `data/portfolio-manifest.json`

### 5.2 Actualizar la web
1. Modifica `data/portfolio-manifest.json`
2. `git add .` y `git commit`
3. Push a `main`/`master` (GitHub Pages se despliega automáticamente)

---

## 6. Validación

- `node --check js/main.js` → sintaxis JS válida
- `git status` → sin archivos locales sensibles
- `grep -r '01_BRANDING_IDENTITY' js/ css/` → debe ser 0 (solo Cloudinary)

---

## 7. Seguridad

- ✅ `.env` **nunca** subir (está en `.gitignore`)
- ✅ Recursos locales `.jpg/.mp4/.pdf` **nunca** subir
- ✅ Solo `main` es rama protegida

---

## 8. Stack de tecnologías

- Node.js (validación)
- Python 3 (`.venv` con: `cloudinary`, `Pillow`, `PyMuPDF`, `imageio-ffmpeg`)
- Cloudinary API
- Git + GitHub (CI/CD vía GitHub Pages)

