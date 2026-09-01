import os
import json

base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ignore = {'702180039_1259967179493290_2998743671173121700_n.jpg'}
catdirs = [
    ('Branding','01_BRANDING_IDENTITY'),
    ('Social Media','02_SOCIAL_MEDIA_DIGITAL'),
    ('BTL & POP','03_BTL_POP_MATERIALES'),
    ('Comerciales TV','Comerciales tv')
]
manifest = {'categories': []}
for label, rel in catdirs:
    path = os.path.join(base, rel)
    if not os.path.isdir(path):
        continue
    cat = {'label': label, 'key': rel.replace(' ', '_').lower(), 'projects': []}
    if label == 'Comerciales TV':
        for fn in sorted(os.listdir(path)):
            if not fn.lower().endswith(('.mp4', '.mov', '.webm')):
                continue
            if fn in ignore:
                continue
            cat['projects'].append({
                'title': os.path.splitext(fn)[0],
                'subtitle': 'Comercial TV',
                'badge': 'Comercial TV',
                'previewImage': os.path.join(rel, fn).replace('\\', '/'),
                'assets': [{'type': 'video', 'src': os.path.join(rel, fn).replace('\\', '/')}],
                'category': label,
                'tags': ['Video', 'TV', 'Producción'],
                'description': 'Spot comercial listo para reproducción directa.'
            })
    else:
        for project in sorted(os.listdir(path)):
            projpath = os.path.join(path, project)
            if not os.path.isdir(projpath):
                continue
            assets = []
            for root, dirs, files in os.walk(projpath):
                for fn in sorted(files):
                    if fn in ignore or fn.startswith('.'):
                        continue
                    ext = fn.lower().split('.')[-1]
                    if ext in ('jpg', 'jpeg', 'png', 'webp', 'gif'):
                        assets.append({'type': 'image', 'src': os.path.join(root, fn).replace(base + os.sep, '').replace('\\', '/')})
                    elif ext in ('mp4', 'mov', 'webm'):
                        assets.append({'type': 'video', 'src': os.path.join(root, fn).replace(base + os.sep, '').replace('\\', '/')})
                    elif ext == 'pdf':
                        assets.append({'type': 'document', 'format': 'pdf', 'src': os.path.join(root, fn).replace(base + os.sep, '').replace('\\', '/'), 'title': fn})
            if not assets:
                continue
            preview = next((a['src'] for a in assets if a['type'] == 'image'), assets[0]['src'])
            cat['projects'].append({
                'title': project.replace('_', ' '),
                'subtitle': project.replace('_', ' '),
                'badge': label,
                'previewImage': preview,
                'assets': assets,
                'category': label,
                'tags': [label, 'Contenido', project.replace('_', ' ')],
                'description': f'Proyecto de {label} para {project.replace("_", " ")}. Incluye {len(assets)} activos.'
            })
    manifest['categories'].append(cat)

outdir = os.path.join(base, 'data')
os.makedirs(outdir, exist_ok=True)
with open(os.path.join(outdir, 'portfolio-manifest.json'), 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print('Generated manifest with', sum(len(c['projects']) for c in manifest['categories']), 'projects')
