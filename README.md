# Portafolio ALEX — Sitio Web Premium (Cloudinary CDN)

Portafolio profesional de **Álvaro Alexander Simbaqueva Sanabria**, una web premium que muestra branding, marketing digital y materiales BTL de clientes reales.

**Todos los recursos gráficos están alojados en Cloudinary** (CDN global `res.cloudinary.com`), por lo que el repositorio es 100% estático y ligero.

---

## 🚀 Demo en vivo

> La URL se publica en GitHub Pages desde el repositorio `alexsimbaqueva/portafolio-alex`.

---

## 📦 Estructura del repositorio

```
.
├── index.html              # Página principal (referencias a Cloudinary)
├── css/
│   └── style.css           # Estilos premium, dark/light, modal PDF
├── js/
│   └── main.js             # Lógica React-style (vanilla JS módulo)
├── data/
│   ├── portfolio-manifest.json       # Datos de proyectos (63 proyectos)
│   └── cloudinary-url-map.json       # Mapeo ruta → URL de Cloudinary (trazabilidad)
├── scripts/
│   ├── upload_to_cloudinary.py       # Herramienta de subida CLI a Cloudinary
│   ├── compress_upload.py            # Compresión + subida (PDF/Video/Imagenes)
│   └── retry_upload_large.py         # Reintento para archivos grandes
├── .env.example                      # Plantilla de credenciales
└── .gitignore
```

> 📁 **NO** se suben los archivos gráficos locales (`01_BRANDING_IDENTITY/`, `assets/`, `perfil/`, etc.). Todo está en Cloudinary.

---

## 🛠️ Instalación y puesta en marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/alexsimbaqueva/portafolio-alex.git
cd portafolio-alex
```

### 2. (Opcional) Servir localmente
Como es HTML/CSS/JS estático, basta con abrir `index.html` o usar:

```bash
# Con Node.js + http-server
npx http-server .

# Con Python
python -m http.server 8080
```

### 3. (Desarrolladores) Subir recursos a Cloudinary
```bash
pip install -r requirements.txt  # cloudinary, Pillow, PyMuPDF, imageio-ffmpeg
python scripts/upload_to_cloudinary.py
```

Se requiere un archivo `.env` con:
```
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Copia `.env.example` a `.env`.

---

## ✨ Características

- 🎨 **Diseño premium** con efectos glassmorphism y transiciones suaves
- 📱 **100% responsive** (mobile-first)
- ☁️ **CDN global vía Cloudinary**: imágenes, videos y PDFs optimizados
- 📑 **Visor de PDF modal**: clic en cualquier PDF → se abre en un modal responsive
- 🎥 **Reproductor de video integrado** con overlay de play
- 🔍 **Lightbox** para imágenes

---

## 📄 Documentación adicional

- 📘 **[Documentación Técnica](Documentacion_Tecnica.md)** — Para desarrolladores y mantenedores
- 📗 **[Documentación de Usuario](Documentacion_Usuario.md)** — Para clientes y usuarios finales

---

## 📄 License

Desarrollado por Álvaro Alexander Simbaqueva · Todos los derechos reservados.

