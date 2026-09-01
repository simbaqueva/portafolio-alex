/* ===== MAIN JAVASCRIPT — Portfolio Premium ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ===== HELPERS =====
  // Codifica solo rutas locales. Deja intactas las URLs web completas
  // (p. ej. Cloudinary) para no doblar la codificacion (%20 -> %2520).
  function resolveUrl(url) {
    if (!url) return url;
    if (/^(https?:)?\/\//i.test(url)) return url; // http(s):// o // ya es URL absoluta
    return encodeURI(url);
  }

  // Detecta si un asset es un PDF (documento, no sitio web)
  function isPdfAsset(asset) {
    if (!asset) return false;
    if (asset.type !== 'document') return false;
    if (asset.format && String(asset.format).toLowerCase() === 'pdf') return true;
    return /\.pdf(\?|#|$)/i.test(String(asset.src || ''));
  }

  // ===== DATA =====
  const portfolioData = {
    branding: [
      {
        title: 'A Mimir',
        subtitle: 'Branding, packaging y mockups',
        badge: 'Identidad de marca',
        category: 'Branding',
        tags: ['Branding', 'Packaging', 'Mockups'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857684/01_BRANDING_IDENTITY/A_Mimir/04_Mockups_Producto/AMimir_Mockup_Cama_Completa.jpg',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857684/01_BRANDING_IDENTITY/A_Mimir/04_Mockups_Producto/AMimir_Mockup_Cama_Completa.jpg' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857687/01_BRANDING_IDENTITY/A_Mimir/04_Mockups_Producto/AMimir_Mockup_Cojin_Decorativo.png' }
        ],
        description: 'Identidad visual para línea textil con dirección de arte en mockups y fotografía de producto.'
      },
      {
        title: 'Bon Bon Appetit',
        subtitle: 'Dirección de arte y fotografía de producto',
        badge: 'Packaging & foto',
        category: 'Branding',
        tags: ['Fotografía', 'Packaging', 'Comunicaciones'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857741/01_BRANDING_IDENTITY/Bon_Bon_Appetit/05_Fotografia/BonBonAppetit_Product_Lineup_Supermarket.jpg',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857741/01_BRANDING_IDENTITY/Bon_Bon_Appetit/05_Fotografia/BonBonAppetit_Product_Lineup_Supermarket.jpg' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857738/01_BRANDING_IDENTITY/Bon_Bon_Appetit/05_Fotografia/BonBonAppetit_Brand_Overview.jpg' }
        ],
        description: 'Proyecto de marca para snacks con foco en fotografía comercial y diseño de packaging.'
      },
      {
        title: 'De La Jinca',
        subtitle: 'Marca, packaging y visual storytelling',
        badge: 'Identidad & producto',
        category: 'Branding',
        tags: ['Marca', 'Storytelling', 'Packaging'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857781/01_BRANDING_IDENTITY/De_La_Jinca/04_Mockups_Producto/DeLaJinca_Mockup_Collage_Productos_Lacteos.jpg',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857781/01_BRANDING_IDENTITY/De_La_Jinca/04_Mockups_Producto/DeLaJinca_Mockup_Collage_Productos_Lacteos.jpg' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787857785/01_BRANDING_IDENTITY/De_La_Jinca/05_Fotografia/DeLaJinca_Queso_Untable_Envase.jpg' }
        ],
        description: 'Estrategia de identidad visual para productos lácteos con foco en empaque premium y fotografía.'
      },
      {
        title: 'Quiere Cacao',
        subtitle: 'Diseño de packaging y propuesta de marca',
        badge: 'Identidad con sabor',
        category: 'Branding',
        tags: ['Packaging', 'Branding', 'Retail'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858058/01_BRANDING_IDENTITY/Quiere_Cacao/04_Mockups_Producto/QuiereCacao_Chocolate_Mockup_Mug.jpg',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858058/01_BRANDING_IDENTITY/Quiere_Cacao/04_Mockups_Producto/QuiereCacao_Chocolate_Mockup_Mug.jpg' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858058/01_BRANDING_IDENTITY/Quiere_Cacao/03_Packaging/QuiereCacao_Packaging_Cacao_Polvo_230g.jpg' }
        ],
        description: 'Proyecto visual completo para marca de chocolate con packaging y mockups dirigidos al consumidor.'
      },
      {
        title: 'Tokio Ramen',
        subtitle: 'Logotipo y diseño de marca',
        badge: 'Branding gastronómico',
        category: 'Branding',
        tags: ['Logo', 'Identidad', 'Alimentos'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858076/01_BRANDING_IDENTITY/Tokio_Ramen/01_Logo/02_Tokio_Ramen_Logo_Primary.jpg',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858076/01_BRANDING_IDENTITY/Tokio_Ramen/01_Logo/02_Tokio_Ramen_Logo_Primary.jpg' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858123/01_BRANDING_IDENTITY/Tokio_Ramen/04_Mockups_Producto/TokioRamen_Kit_Identidad_Visual.png' }
        ],
        description: 'Desarrollo de identidad visual para restaurante con enfoque en estilo y reconocimiento de marca.'
      }
    ],
    social: [
      {
        title: 'Domo Motors',
        subtitle: 'Estrategia visual para redes automotrices',
        badge: 'Social Media',
        category: 'Social Media',
        tags: ['Feed', 'Stories', 'Reels'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858150/02_SOCIAL_MEDIA_DIGITAL/Domo_Motors/01_Posts_Feed/DOMOTORS_SocialMedia_BMW_Silver_Front_View.png',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858150/02_SOCIAL_MEDIA_DIGITAL/Domo_Motors/01_Posts_Feed/DOMOTORS_SocialMedia_BMW_Silver_Front_View.png' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858157/02_SOCIAL_MEDIA_DIGITAL/Domo_Motors/01_Posts_Feed/DomoMotors_Post_Redes_Sociales.png' }
        ],
        description: 'Contenido social para concesionario con diseño impactante y piezas pensadas para conversión digital.'
      },
      {
        title: 'Escalautos',
        subtitle: 'Contenidos para feed y stories',
        badge: 'Redes sociales',
        category: 'Social Media',
        tags: ['Stories', 'Feed', 'Animación'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858485/02_SOCIAL_MEDIA_DIGITAL/Escalautos/01_Posts_Feed/andinaRecurso%2017.png',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858485/02_SOCIAL_MEDIA_DIGITAL/Escalautos/01_Posts_Feed/andinaRecurso%2017.png' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858483/02_SOCIAL_MEDIA_DIGITAL/Escalautos/01_Posts_Feed/andinaRecurso%2016.png' }
        ],
        description: 'Diseño digital para contenido automotriz, con piezas pensadas para audiencias jóvenes y canales sociales.'
      },
      {
        title: 'GanaGana',
        subtitle: 'Campañas de redes sociales',
        badge: 'Social Media',
        category: 'Social Media',
        tags: ['Performance', 'Visuales', 'Digital'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858744/02_SOCIAL_MEDIA_DIGITAL/GanaGana/01_Posts_Feed/GanaGana_Post_SocialMedia_Financiamiento_Celular.png',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858744/02_SOCIAL_MEDIA_DIGITAL/GanaGana/01_Posts_Feed/GanaGana_Post_SocialMedia_Financiamiento_Celular.png' }
        ],
        description: 'Proyecto social con comunicaciones para ventas y financiamiento digital, enfocado en retail móvil.'
      },
      {
        title: 'Lider iGo',
        subtitle: 'Estrategia visual para retail digital',
        badge: 'Social Media',
        category: 'Social Media',
        tags: ['Retail', 'Contenido', 'Branding'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858745/02_SOCIAL_MEDIA_DIGITAL/Lider_iGo/01_Posts_Feed/d2efe008-09bc-49d8-8f6d-b92b289e6f5f.jpg',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858745/02_SOCIAL_MEDIA_DIGITAL/Lider_iGo/01_Posts_Feed/d2efe008-09bc-49d8-8f6d-b92b289e6f5f.jpg' }
        ],
        description: 'Contenido digital para retail desde la estrategia hasta la ejecución visual en redes.'
      }
    ],
    btl: [
      {
        title: 'Domo Motors',
        subtitle: 'Materiales POP y activaciones de punto de venta',
        badge: 'BTL & POP',
        category: 'BTL & POP',
        tags: ['Retail', 'Experiencia', 'Activación'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858877/03_BTL_POP_MATERIALES/Domo_Motors/04_Punto_Venta/02_DOMOTORS_BMW_Silver_Showcase.png',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858877/03_BTL_POP_MATERIALES/Domo_Motors/04_Punto_Venta/02_DOMOTORS_BMW_Silver_Showcase.png' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858881/03_BTL_POP_MATERIALES/Domo_Motors/04_Punto_Venta/DomoMotors_Moto_Exhibicion_2.png' }
        ],
        description: 'Diseño de piezas para punto de venta, merchandising y exhibición de marca en concesionario.'
      },
      {
        title: 'GanaGana',
        subtitle: 'Activaciones y señalética para retail',
        badge: 'BTL & POP',
        category: 'BTL & POP',
        tags: ['Retail', 'Señalética', 'Eventos'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858918/03_BTL_POP_MATERIALES/GanaGana/04_Punto_Venta/GanaGana_Punto_Venta_Centro_Comercial.png',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858918/03_BTL_POP_MATERIALES/GanaGana/04_Punto_Venta/GanaGana_Punto_Venta_Centro_Comercial.png' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858914/03_BTL_POP_MATERIALES/GanaGana/02_Eventos_Activaciones/GanaGana_Mockup_Punto_Venta_v4.png' }
        ],
        description: 'Materiales BTL para activaciones en plaza comercial con énfasis en experiencia de marca.'
      },
      {
        title: 'Lider iGo',
        subtitle: 'Diseño de retail, señalización y promociones',
        badge: 'BTL & POP',
        category: 'BTL & POP',
        tags: ['Promociones', 'Retail', 'Merchandising'],
        previewImage: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858964/03_BTL_POP_MATERIALES/Lider_iGo/04_Punto_Venta/Lider_iGo_Publicidad_Exterior_Edificio.png',
        detailMedia: [
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858964/03_BTL_POP_MATERIALES/Lider_iGo/04_Punto_Venta/Lider_iGo_Publicidad_Exterior_Edificio.png' },
          { type: 'image', src: 'https://res.cloudinary.com/bejbzt7n/image/upload/v1787858939/03_BTL_POP_MATERIALES/Lider_iGo/02_Eventos_Activaciones/Lider_iGo_Mockup_Packaging_Kit_Rojo.png' }
        ],
        description: 'Piezas de punto de venta con identidad sólida para retail y activaciones de marca.'
      }
    ],
    tv: [
      {
        title: 'Spot Comercial Torre Eiffel',
        subtitle: 'Video publicitario para TV',
        badge: 'Comercial TV',
        category: 'Comerciales TV',
        tags: ['Video', 'Producción', 'Edición'],
        detailMedia: [
          { type: 'video', src: 'https://res.cloudinary.com/bejbzt7n/video/upload/v1787859155/Comerciales%20tv/comercial-torre-eiffel.mp4' }
        ],
        description: 'Spot comercial producido y editado para difusión en televisión y plataformas digitales.'
      },
      {
        title: 'Spot Comercial Turquesa',
        subtitle: 'Video publicitario para TV',
        badge: 'Comercial TV',
        category: 'Comerciales TV',
        tags: ['Video', 'Storytelling', 'Edición'],
        detailMedia: [
          { type: 'video', src: 'https://res.cloudinary.com/bejbzt7n/video/upload/v1787859201/Comerciales%20tv/spot-comercial-turquesa.mp4' }
        ],
        description: 'Edición de comercial con enfoque narrativo y presencia visual fuerte para televisión.'
      }
    ]
  };

  const portfolioManifestPath = 'data/portfolio-manifest.json';
  
  function formatCategoryId(label) {
    return label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  function normalizeManifest(data) {
    const iconMap = {
      'branding': 'fa-paint-brush',
      'social media': 'fa-hashtag',
      'btl & pop': 'fa-print',
      'comerciales tv': 'fa-video',
      'programación web': 'fa-code'
    };
    return (data.categories || []).map(category => {
      const label = (category.label || '').toLowerCase();
      return {
        ...category,
        id: category.key || formatCategoryId(category.label || ''),
        projects: category.projects || [],
        icon: category.icon || iconMap[label] || 'fa-folder-open'
      };
    });
  }
  
  function loadPortfolioManifest() {
    const cacheBustedPath = `${portfolioManifestPath}?t=${Date.now()}`;
    return fetch(cacheBustedPath)
      .then(response => {
        if (!response.ok) throw new Error('Manifest no encontrado');
        return response.json();
      })
      .then(normalizeManifest)
      .catch(error => {
        console.warn('No se pudo cargar el manifiesto de portfolio:', error);
        return [
          { id: 'branding', label: 'Branding', icon: 'fa-paint-brush', projects: portfolioData.branding },
          { id: 'social', label: 'Social Media', icon: 'fa-hashtag', projects: portfolioData.social },
          { id: 'btl', label: 'BTL & POP', icon: 'fa-print', projects: portfolioData.btl },
          { id: 'tv', label: 'Comerciales TV', icon: 'fa-video', projects: portfolioData.tv }
        ];
      });
  }

  const experience = [
    {
      company: 'BDBRAND s.a.s',
      role: 'Diseñador de marcas',
      date: 'Dic 2025 — Abr 2026',
      desc: 'Creación y mantenimiento de identidades visuales para múltiples marcas en canales ATL y BTL. Desarrollo de landing pages y sitios web.'
    },
    {
      company: 'Media Project Comunicación Estratégica s.a.s',
      role: 'Diseñador de marcas',
      date: 'Jun 2025 — Dic 2025',
      desc: 'Diseño de identidad visual corporativa, redes sociales, contenido digital y desarrollo web.'
    },
    {
      company: 'El Arrozal y Cia. SCA — Supermercados Líder',
      role: 'Diseñador publicitario',
      date: 'Feb 2023 — Jun 2025',
      desc: 'Dirección de estilo visual para comunicación interna/externa. Redes sociales y desarrollo web en WordPress.'
    },
    {
      company: 'Media Project Comunicación Estratégica s.a.s',
      role: 'Diseñador gráfico',
      date: 'Sep 2022 — Feb 2023',
      desc: 'Edición audiovisual, motion graphics, diseño de impresos para City TV. Creación del logo corporativo.'
    },
    {
      company: 'Media Project Comunicación Estratégica s.a.s',
      role: 'Diseñador gráfico Freelancer',
      date: 'Ago 2021 — Sep 2022',
      desc: 'Edición audiovisual, animación 2D, contenido redes sociales y spots para City TV.'
    },
    {
      company: 'Guía Kilómetro y Medio',
      role: 'Editor audiovisual',
      date: 'Mar 2021 — Ago 2021',
      desc: 'Spots publicitarios, motion graphics, cromakey, montaje y etalonaje.'
    },
    {
      company: 'Banlinea',
      role: 'Desarrollador Front-end',
      date: 'Ene 2017 — Ago 2017',
      desc: 'Desarrollo con Angular, HTML5, CSS3, Sass, Node.js, JavaScript, Python, jQuery.'
    }
  ];

  const skillsData = [
    { name: 'After Effects', icon: 'fa-bolt', level: 95 },
    { name: 'DaVinci Resolve', icon: 'fa-video', level: 90 },
    { name: 'Nuke', icon: 'fa-cube', level: 75 },
    { name: 'Premiere Pro', icon: 'fa-film', level: 90 },
    { name: 'Photoshop', icon: 'fa-image', level: 85 },
    { name: 'Illustrator', icon: 'fa-pen-nib', level: 85 },
    { name: 'JavaScript', icon: 'fa-code', level: 80 },
    { name: 'Python', icon: 'fa-brands fa-python', level: 70 },
    { name: 'C++', icon: 'fa-terminal', level: 60 },
    { name: 'HTML5/CSS3', icon: 'fa-file-code', level: 90 },
    { name: 'Motion Graphics', icon: 'fa-play', level: 90 },
    { name: 'Composición VFX', icon: 'fa-wand-magic-sparkles', level: 85 },
    { name: 'Color Grading', icon: 'fa-palette', level: 85 },
    { name: 'WordPress', icon: 'fa-brands fa-wordpress', level: 80 },
    { name: 'Angular', icon: 'fa-brands fa-angular', level: 75 },
    { name: 'Node.js', icon: 'fa-brands fa-node-js', level: 70 },
    { name: 'Inteligencia Artificial generativa', icon: 'fa-robot', level: 85 },
    { name: 'ComfyUI', icon: 'fa-layer-group', level: 80 },
    { name: 'Runway AI', icon: 'fa-video', level: 85 },
    { name: 'Sora', icon: 'fa-film', level: 80 },
    { name: 'Nano Banana', icon: 'fa-paintbrush', level: 80 },
    { name: 'Claude Code', icon: 'fa-code', level: 85 },
    { name: 'OpenClaw', icon: 'fa-claw-marks', level: 75 },
    { name: 'ChatGPT', icon: 'fa-comment-dots', level: 90 },
    { name: 'Grok', icon: 'fa-bolt', level: 80 },
    { name: 'n8n', icon: 'fa-diagram-project', level: 80 },
    { name: 'Make · Flujos de trabajo generativos y procesamiento por lotes', icon: 'fa-wand-magic-sparkles', level: 80 }
  ];

  const educationData = [
    {
      institution: 'Corporación Escuela de Artes y Letras',
      degree: 'Realizador de Cine y Televisión',
      focus: 'Arte y Diseño de Producción Audiovisual',
      date: '2023 — 2033'
    },
    {
      institution: 'SENA',
      degree: 'Técnico en Programación de Software',
      focus: 'Information Technology',
      date: 'Feb 2016 — Oct 2017'
    },
    {
      institution: 'SENA',
      degree: 'Técnico en Diseño e Integración de Multimedia',
      focus: 'Diseño Multimedia',
      date: '2018 — 2021'
    },
    {
      institution: 'MediaPro Training Center',
      degree: 'Curso en Video Digital — Premiere Pro',
      focus: 'Comunicación Audiovisual',
      date: 'Mar — Abr 2020'
    },
    {
      institution: 'Domestika',
      degree: 'Secretos del Fotomontaje y Retoque Creativo',
      focus: 'Diseño Gráfico',
      date: 'Abr — May 2022'
    },
    {
      institution: 'SENA',
      degree: 'Inmersión a la Fotografía Digital',
      focus: 'Fotografía Digital',
      date: 'Jun — Jul 2019'
    }
  ];

  const typedTexts = [
    'Compositor Digital VFX',
    'Diseñador Multimedia',
    'Frontend Developer',
    'Motion Graphics Artist',
    'Color Grading Specialist',
    'Ai Content Creation Specialist'
  ];

  // ===== LIGHTBOX STATE =====
  let lightboxItems = [];
  let lightboxIndex = 0;

  // ===== UTILITY =====
  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getBrandIcon(name) {
    const icons = ['fa-paint-brush', 'fa-crown', 'fa-star', 'fa-gem', 'fa-fire',
                   'fa-leaf', 'fa-rocket', 'fa-bolt', 'fa-sun', 'fa-moon',
                   'fa-tree', 'fa-water', 'fa-cloud', 'fa-mountain', 'fa-heart',
                   'fa-infinity', 'fa-compass', 'fa-dragon', 'fa-feather', 'fa-fish'];
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return icons[hash % icons.length];
  }

  function getClientIcon(name) {
    const icons = ['fa-car', 'fa-truck', 'fa-gift', 'fa-shopping-cart', 'fa-store', 'fa-tag'];
    const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return icons[hash % icons.length];
  }

  function getRandomParticle() {
    const colors = ['#4f8bff', '#82b4ff', '#2b6cff', '#071028', '#0d2d55'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function formatPathName(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  // ===== PARTICLES =====
  function createParticles() {
    const container = document.getElementById('particles');
    const count = 50;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.background = getRandomParticle();
      particle.style.width = (Math.random() * 4 + 2) + 'px';
      particle.style.height = particle.style.width;
      particle.style.animationDuration = (Math.random() * 18 + 10) + 's';
      particle.style.animationDelay = (Math.random() * 20) + 's';
      container.appendChild(particle);
    }
  }
  createParticles();

  // ===== TYPED TEXT =====
  function initTypedText() {
    const el = document.getElementById('typedText');
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentText = typedTexts[textIndex];
      if (!isDeleting) {
        el.innerHTML = currentText.slice(0, charIndex + 1) + '<span class="cursor-blink">|</span>';
        charIndex++;
        if (charIndex === currentText.length) {
          isDeleting = true;
          setTimeout(type, 2000);
          return;
        }
        setTimeout(type, 80 + Math.random() * 40);
      } else {
        el.innerHTML = currentText.slice(0, charIndex) + '<span class="cursor-blink">|</span>';
        charIndex--;
        if (charIndex < 0) {
          isDeleting = false;
          textIndex = (textIndex + 1) % typedTexts.length;
          setTimeout(type, 500);
          return;
        }
        setTimeout(type, 40 + Math.random() * 30);
      }
    }
    type();
  }
  initTypedText();

  // ===== PORTFOLIO GALLERY =====
  async function initPortfolio() {
    const tabsContainer = document.getElementById('portfolioTabs');
    const grid = document.getElementById('portfolioGrid');
    const previewPanel = document.getElementById('portfolioPreview');
    const previewMedia = document.getElementById('previewMedia');
    const previewCategory = document.getElementById('previewCategory');
    const previewBadge = document.getElementById('previewBadge');
    const previewTitle = document.getElementById('previewTitle');
    const previewDescription = document.getElementById('previewDescription');
    const previewTags = document.getElementById('previewTags');
    const previewGallery = document.getElementById('previewGallery');
    const previewClose = document.getElementById('portfolioPreviewClose');
    const previewToolbar = previewPanel.querySelector('.preview-toolbar');
    let activeCategory = 'branding';
    let selectedCard = null;

    const categories = await loadPortfolioManifest();
    if (!categories.length) {
      tabsContainer.innerHTML = '<div class="portfolio-empty">No hay proyectos disponibles en este momento.</div>';
      grid.innerHTML = '';
      return;
    }

    categories.forEach(cat => {
      cat.count = cat.projects.length;
    });

    activeCategory = categories[0].id;

    // ===== DEVICE RESOLUTION SWITCHER =====
    const deviceBtns = document.querySelectorAll('.preview-device-btn');
    deviceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        deviceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const width = btn.dataset.width;
        const deviceFrame = previewMedia.querySelector('.device-frame');
        if (deviceFrame) {
          const iframe = deviceFrame.querySelector('iframe');
          if (iframe) {
            iframe.style.width = width;
          }
          deviceFrame.style.maxWidth = width;
          if (width === '100%') {
            deviceFrame.style.justifyContent = 'center';
          }
        }
      });
    });

    function renderMedia(asset) {
      previewMedia.innerHTML = '';
      if (!asset) {
        previewMedia.innerHTML = `
          <div class="preview-placeholder">
            <i class="fas fa-camera-retro"></i>
            <span>El contenido de este proyecto se mostrará aquí.</span>
          </div>
        `;
        return;
      }
      if (asset.type === 'video') {
        const video = document.createElement('video');
        video.src = resolveUrl(asset.src);
        video.controls = true;
        video.autoplay = true;
        // Allow sound when the user opened the preview / interacted — unmute so play has audio
        video.muted = false;
        video.loop = true;
        previewMedia.appendChild(video);
      } else if (asset.type === 'document') {
        const isWeb = /^https?:\/\//.test(asset.src || '');
        const iframe = document.createElement('iframe');
        iframe.src = resolveUrl(asset.src);
        iframe.setAttribute('frameborder', '0');
        if (isWeb) {
          iframe.className = 'preview-document';
          const deviceFrame = document.createElement('div');
          deviceFrame.className = 'device-frame';
          deviceFrame.appendChild(iframe);
          previewMedia.appendChild(deviceFrame);
        } else {
          // PDF o documento local - envolver en contenedor clickeable
          iframe.className = 'preview-document preview-document--static';
          const wrapper = document.createElement('div');
          wrapper.className = 'preview-document-wrapper';
          wrapper.style.cssText = 'position:relative;width:100%;height:100%;cursor:zoom-in;';
          wrapper.appendChild(iframe);
          // Al hacer clic, abrir el modal PDF
          wrapper.addEventListener('click', () => {
            if (window.openPdfModal) {
              window.openPdfModal(asset.src, asset.title || 'Documento');
            }
          });
          previewMedia.appendChild(wrapper);
        }
      } else {
        const img = document.createElement('img');
        img.src = resolveUrl(asset.src);
        img.alt = asset.alt || 'Vista del proyecto';
        previewMedia.appendChild(img);
      }
    }

    // ===== PDF MODAL =====
    const pdfModal = document.getElementById('pdfModal');
    const pdfModalFrame = document.getElementById('pdfModalFrame');
    const pdfModalTitle = document.getElementById('pdfModalTitle');
    const pdfModalClose = document.getElementById('pdfModalClose');
    const pdfModalBackdrop = document.getElementById('pdfModalBackdrop');

    function openPdfModal(src, title = 'PDF') {
      if (!pdfModal || !pdfModalFrame) return;
      pdfModalFrame.src = resolveUrl(src);
      pdfModalTitle.textContent = title;
      pdfModal.classList.add('active');
      pdfModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closePdfModal() {
      if (!pdfModal || !pdfModalFrame) return;
      pdfModal.classList.remove('active');
      pdfModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        pdfModalFrame.src = '';
      }, 300);
    }

    // Exponer para usos externos (p. ej. el wrapper del PDF en el panel)
    window.openPdfModal = openPdfModal;

    if (pdfModalClose) {
      pdfModalClose.addEventListener('click', closePdfModal);
    }

    if (pdfModalBackdrop) {
      pdfModalBackdrop.addEventListener('click', closePdfModal);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && pdfModal?.classList.contains('active')) {
        closePdfModal();
      }
    });

    function renderPreview(item, cardElement) {
      if (selectedCard) selectedCard.classList.remove('selected');
      selectedCard = cardElement;
      selectedCard.classList.add('selected');

      previewCategory.textContent = item.category;
      previewBadge.textContent = item.badge;
      previewTitle.textContent = item.title;
      previewDescription.textContent = item.description;
      previewTags.innerHTML = item.tags ? item.tags.map(tag => `<span>${tag}</span>`).join('') : '';
      previewGallery.innerHTML = '';

      // Mostrar el toolbar de resolución solo para proyectos web (sitios en línea)
      const isWebProject = (item.assets || item.detailMedia || []).some(a => a.type === 'document' && /^https?:\/\//.test(a.src || ''));
      previewToolbar.style.display = isWebProject ? 'flex' : 'none';

      if (isWebProject) {
        // Reset al ancho Escritorio (100%) cuando se abre un proyecto web
        deviceBtns.forEach(b => {
          b.classList.remove('active');
          if (b.dataset.width === '100%') b.classList.add('active');
        });
      }

      // Enlaces de acción para el proyecto
      const existingLinks = previewPanel.querySelectorAll('.preview-action-link');
      existingLinks.forEach(el => el.remove());

      // Enlace directo al sitio web (si el proyecto tiene un asset con URL web)
      const webUrl = (item.assets || item.detailMedia || []).find(a => a.type === 'document' && /^https?:\/\//.test(a.src || ''))?.src || null;

      const linksWrapper = document.createElement('div');
      linksWrapper.className = 'preview-links-wrapper';

      if (webUrl) {
        const webLink = document.createElement('a');
        webLink.className = 'preview-action-link preview-site-link';
        webLink.href = webUrl;
        webLink.target = '_blank';
        webLink.rel = 'noopener';
        webLink.innerHTML = '<i class="fas fa-external-link-alt"></i> Visitar sitio web';
        linksWrapper.appendChild(webLink);
      }

      if (item.githubUrl) {
        const githubLink = document.createElement('a');
        githubLink.className = 'preview-action-link preview-github-link';
        githubLink.href = item.githubUrl;
        githubLink.target = '_blank';
        githubLink.rel = 'noopener';
        githubLink.innerHTML = '<i class="fab fa-github"></i> Ver código en GitHub';
        linksWrapper.appendChild(githubLink);
      }

      if (linksWrapper.children.length > 0) {
        // Insertar los enlaces dentro de preview-info, después de previewGallery
        const previewInfo = previewPanel.querySelector('.preview-info');
        if (previewInfo) {
          previewInfo.appendChild(linksWrapper);
        }
      }

      const assets = item.assets || item.detailMedia || [];
      const defaultAsset = assets.find(asset => asset.type === 'image') || assets[0] || null;
      renderMedia(defaultAsset);

      if (assets.length > 0) {
        let initialIndex = assets.indexOf(defaultAsset);
        if (initialIndex === -1) initialIndex = 0;

        assets.forEach((asset, index) => {
          const thumb = document.createElement('button');
          thumb.type = 'button';
          thumb.className = 'preview-thumb' + (index === initialIndex ? ' selected' : '');
          if (asset.type === 'video') {
            thumb.innerHTML = `<video src="${resolveUrl(asset.src)}" muted playsinline preload="metadata"></video>`;
          } else if (asset.type === 'document') {
            const isWeb = /^https?:\/\//.test(asset.src || '');
            thumb.innerHTML = `<div class="preview-doc-icon"><i class="fas ${isWeb ? 'fa-globe' : 'fa-file-pdf'}"></i><span>${asset.title || (isWeb ? 'Sitio Web' : 'PDF')}</span></div>`;
          } else {
            thumb.innerHTML = `<img src="${resolveUrl(asset.src)}" alt="${item.title} detalle">`;
          }
          thumb.addEventListener('click', () => {
            document.querySelectorAll('.preview-thumb').forEach(el => el.classList.remove('selected'));
            thumb.classList.add('selected');
            if (asset.type === 'video') {
              openLightboxAsset(asset, item.title);
            } else if (asset.type === 'document' && isPdfAsset(asset)) {
              openPdfModal(asset.src, asset.title);
            } else {
              renderMedia(asset);
            }
          });
          previewGallery.appendChild(thumb);
        });
      }

      previewPanel.hidden = false;
      previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Render tabs
    categories.forEach(cat => {
      const tab = document.createElement('button');
      tab.className = 'portfolio-tab' + (cat.id === activeCategory ? ' active' : '');
      tab.dataset.category = cat.id;
      tab.innerHTML = `<i class="fas ${cat.icon}"></i> ${cat.label} <span class="count">(${cat.count})</span>`;
      tab.addEventListener('click', () => {
        document.querySelectorAll('.portfolio-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeCategory = cat.id;
        renderPortfolioItems(cat.id);
      });
      tabsContainer.appendChild(tab);
    });

    function renderPortfolioItems(category) {
      if (selectedCard) {
        selectedCard.classList.remove('selected');
        selectedCard = null;
      }
      previewPanel.hidden = true;
      previewToolbar.style.display = 'none';
      grid.innerHTML = '';
      grid.style.opacity = '0';
      setTimeout(() => { grid.style.opacity = '1'; }, 50);

      const projects = [...(categories.find(cat => cat.id === category)?.projects || [])];

      // Normalize lightbox items so openLightbox can rely on consistent properties
      lightboxItems = projects.map(p => {
        const imgAsset = p.assets?.find(a => a.type === 'image')?.src || null;
        const videoAsset = p.assets?.find(a => a.type === 'video')?.src || null;
        let previewSrc = '';
        if (imgAsset) {
          previewSrc = imgAsset;
        } else if (p.previewImage && !(/\.mp4$/i).test(p.previewImage)) {
          previewSrc = p.previewImage;
        } else if (videoAsset) {
          previewSrc = videoAsset;
        } else {
          previewSrc = p.previewImage || '';
        }

        const isVideo = (/\.mp4|\.mov|\.webm$/i).test(previewSrc);
        const videoSrc = videoAsset || (isVideo ? previewSrc : null);

        return Object.assign({}, p, {
          previewImage: previewSrc,
          isVideo: isVideo,
          lightboxPath: videoSrc
        });
      });

      // Shuffle a view-only copy so indices for lightbox remain stable
      const viewItems = shuffleArray([...lightboxItems]);

      viewItems.forEach((item, idx) => {
        const originalIndex = lightboxItems.indexOf(item);
        const card = document.createElement('div');
        card.className = 'portfolio-item reveal-scale';
        card.style.transitionDelay = (idx * 0.03) + 's';
        card.dataset.lbIndex = originalIndex;

        const previewSrc = item.previewImage || '';
        const isVideoPreview = item.isVideo;

        card.innerHTML = `
          <div class="portfolio-item-thumb">
            ${previewSrc ? (isVideoPreview ? `<video src="${resolveUrl(previewSrc)}" muted playsinline preload="metadata"></video>` : `<img src="${resolveUrl(previewSrc)}" alt="${item.title}">`) : `<div class="fallback-icon"><i class="fas ${isVideoPreview ? 'fa-play-circle' : getBrandIcon(item.title)}"></i></div>`}
            <div class="portfolio-item-overlay">
              <i class="fas ${isVideoPreview ? 'fa-play-circle' : 'fa-expand'}"></i>
            </div>
          </div>
          <div class="portfolio-item-info">
            <h4>${item.title}</h4>
            <p>${item.subtitle || 'Ver detalles del proyecto.'}</p>
            <span class="file-badge">${item.badge}</span>
          </div>
        `;

        // Click on card opens preview for most categories, but for Comerciales TV open the responsive video modal
        card.addEventListener('click', () => {
          const currentCategory = categories.find(cat => cat.id === activeCategory);
          if (currentCategory && currentCategory.id === 'comerciales_tv') {
            openLightbox(originalIndex);
          } else {
            renderPreview(item, card);
          }
        });

        // If thumbnail contains a video element, intercept its click/play to open lightbox instead
        setTimeout(() => {
          const thumbVideo = card.querySelector('video');
          if (thumbVideo) {
            thumbVideo.addEventListener('click', (ev) => {
              ev.stopPropagation();
              openLightbox(originalIndex);
            });
            thumbVideo.addEventListener('play', (ev) => {
              // Prevent inline playback and open lightbox with sound
              ev.preventDefault();
              thumbVideo.pause();
              openLightbox(originalIndex);
            });
          }
        }, 0);

        grid.appendChild(card);
      });

      setTimeout(() => {
        document.querySelectorAll('#portfolioGrid .reveal-scale').forEach(el => el.classList.add('visible'));
      }, 100);
    }

    previewClose.addEventListener('click', () => {
      previewPanel.hidden = true;
      previewToolbar.style.display = 'none';
      if (selectedCard) selectedCard.classList.remove('selected');
    });

    renderPortfolioItems(activeCategory);
  }
  initPortfolio();

  // ===== LIGHTBOX =====
  let lightboxAssetMode = false;

  function openLightbox(index) {
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    const caption = document.getElementById('lightboxCaption');
    lightboxAssetMode = false;
    lightboxIndex = index;
    const item = lightboxItems[index];

    content.innerHTML = '';

    if (item.isVideo) {
      const video = document.createElement('video');
      video.src = resolveUrl(item.lightboxPath);
      video.controls = true;
      video.autoplay = true;
      video.muted = false;
      content.appendChild(video);
    } else if (item.previewImage) {
      const img = document.createElement('img');
      img.src = resolveUrl(item.previewImage);
      img.alt = item.title;
      content.appendChild(img);
    } else {
      const iconClass = item.isVideo ? 'fa-play-circle' : 'fa-folder-open';
      const folderUrl = item.folderPath ? encodeURI(item.folderPath) : '#';
      content.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--text-secondary);max-width:500px;">
          <i class="fas ${iconClass}" style="font-size:4rem;margin-bottom:20px;opacity:0.5"></i>
          <h3 style="margin-bottom:12px;color:var(--text-primary);">${item.title}</h3>
          <p style="margin-bottom:20px;line-height:1.8;">Este proyecto está disponible dentro de la carpeta. Aquí puedes ver el detalle y continuar con una revisión profesional.</p>
          <button class="btn btn-primary" onclick="window.open('${folderUrl}','_blank')">
            <i class="fas fa-folder-open"></i> Abrir carpeta
          </button>
        </div>
      `;
    }

    caption.textContent = item.title;
    lightbox.classList.toggle('asset-mode', false);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function openLightboxAsset(asset, title) {
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    const caption = document.getElementById('lightboxCaption');
    lightboxAssetMode = true;

    content.innerHTML = '';
    const video = document.createElement('video');
    video.src = resolveUrl(asset.src);
    video.controls = true;
    video.autoplay = true;
    video.muted = false;
    content.appendChild(video);

    caption.textContent = `${title} — Video`;
    lightbox.classList.add('asset-mode');
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    const content = document.getElementById('lightboxContent');
    lightboxAssetMode = false;
    lightbox.classList.remove('open');
    lightbox.classList.remove('asset-mode');
    content.innerHTML = '';
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    lightboxIndex = (lightboxIndex + dir + lightboxItems.length) % lightboxItems.length;
    openLightbox(lightboxIndex);
  }

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));

  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('lightbox');
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLightbox();
  });

  // ===== RENDER EXPERIENCE =====
  function renderExperience() {
    const timeline = document.getElementById('timeline');
    experience.forEach((exp, index) => {
      const item = document.createElement('div');
      item.className = 'timeline-item reveal-left';
      item.style.transitionDelay = (index * 0.08) + 's';
      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-date">${exp.date}</div>
        <div class="timeline-company">${exp.company}</div>
        <div class="timeline-role">${exp.role}</div>
        <div class="timeline-desc">${exp.desc}</div>
      `;
      timeline.appendChild(item);
    });
  }
  renderExperience();

  // ===== RENDER SKILLS =====
  function renderSkills() {
    const grid = document.getElementById('skillsGrid');
    shuffleArray([...skillsData]).forEach((skill, idx) => {
      const card = document.createElement('div');
      card.className = 'skill-card reveal-scale';
      card.style.transitionDelay = (idx * 0.03) + 's';
      card.innerHTML = `
        <div class="skill-card-icon"><i class="fas ${skill.icon}"></i></div>
        <h4>${skill.name}</h4>
        <div class="skill-bar">
          <div class="skill-bar-fill" data-level="${skill.level}"></div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  renderSkills();

  // ===== RENDER EDUCATION =====
  function renderEducation() {
    const grid = document.getElementById('educationGrid');
    const icons = ['fa-film', 'fa-laptop-code', 'fa-video', 'fa-paint-brush', 'fa-camera'];
    educationData.forEach((edu, idx) => {
      const card = document.createElement('div');
      card.className = 'edu-card reveal';
      card.style.transitionDelay = (idx * 0.08) + 's';
      const icon = icons[idx % icons.length];
      card.innerHTML = `
        <div class="edu-card-icon"><i class="fas ${icon}"></i></div>
        <h4>${edu.degree}</h4>
        <div class="edu-institution">${edu.institution}</div>
        <div class="edu-date">${edu.date}</div>
        ${edu.focus ? `<div class="edu-focus">${edu.focus}</div>` : ''}
      `;
      grid.appendChild(card);
    });
  }
  renderEducation();

  // ===== SCROLL REVEAL =====
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          const barFill = entry.target.querySelector('.skill-bar-fill');
          if (barFill) {
            setTimeout(() => {
              barFill.style.width = barFill.dataset.level + '%';
            }, 200);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revealElements.forEach(el => observer.observe(el));
  }
  initScrollReveal();

  // ===== COUNTER ANIMATION =====
  function initCounters() {
    const counters = document.querySelectorAll('.stat-num');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.count);
          let current = 0;
          const increment = Math.ceil(target / 30);
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            entry.target.textContent = current;
          }, 30);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
  }
  setTimeout(initCounters, 500);

  // ===== NAVBAR =====
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const links = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      navbar.classList.toggle('scrolled', scrollY > 50);
      // Active link
      links.forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section) {
          const rect = section.getBoundingClientRect();
          link.classList.toggle('active', rect.top <= 150 && rect.bottom >= 150);
        }
      });
    });
  }
  initNavbar();

  // ===== MOBILE MENU =====
  function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });
  }
  initMobileMenu();

  // ===== CONTACT FORM =====
  function initForm() {
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = 'Enviando... <i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          btn.innerHTML = '✓ Mensaje Enviado';
          btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          form.reset();
          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.disabled = false;
          }, 4000);
        } else {
          throw new Error('Formspree respondió con un error');
        }
      } catch (error) {
        btn.innerHTML = '✗ Error al enviar';
        btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        console.error('Error enviando el formulario:', error);
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.disabled = false;
        }, 4000);
      }
    });
  }
  initForm();

  // ===== FOOTER YEAR =====
  document.getElementById('year').textContent = new Date().getFullYear();

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  console.log('%c🎬 Álvaro Alexander Simbaqueva — Portfolio VFX', 'font-size:18px;background:linear-gradient(135deg,#84b8ff,#2b6cff);padding:12px 20px;color:white;border-radius:8px;font-weight:bold;');
  console.log('%c📱 Diseño responsive | 🎨 Glassmorphism | 🖼️ Lightbox Gallery', 'font-size:13px;color:#b5d3ff;');
});