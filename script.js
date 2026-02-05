const menuToggle = document.querySelector('.toggle')
const page = document.querySelector('.page')
const text = document.querySelector('.text')
const verVideo = document.querySelectorAll('.js-open-video')
const videoCompleto = document.querySelector('.video-completo')
const reproductor = document.querySelector('.reproductor')
const video = document.getElementById('video-home')
const videoFondo = document.getElementById('video-fondo')
const overlay = document.querySelector('.overlay')
const header = document.querySelector('header')
const wpBtn = document.querySelector('.btn-wp')

document.addEventListener("touchstart", () => {}, { passive: true });

//LOADER ===================================================//
const tapa = document.querySelector('.tapa')
function preloadImages(urls) {
  return Promise.all(
    urls.map((url) => new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = url
    }))
  )
}

function preloadVideo() {
    return new Promise((resolve, reject) => {
        // Si el video ya está cargado
        if (videoFondo.readyState >= 3) {
            resolve();
            return;
        }
        
        // Cuando el video puede reproducirse
        videoFondo.addEventListener('canplaythrough', () => {
            resolve();
        }, { once: true })
        
        // Si hay error
        videoFondo.addEventListener('error', () => {
            reject(new Error('Error al cargar el video'))
        }, { once: true })

        // Forzar la carga del video
        videoFondo.load()
    })
}
//========================//


// TAPA DISPLAY NONE ===================================================//
function hideTapa(delay = 0) {
    setTimeout(() => {
        tapa.classList.add('loaded')
        document.body.classList.remove('no-scroll')
    setTimeout(() => {
        tapa.style.display = 'none'
        text.classList.add('visible') // Inicia justo al ocultar la tapa
    }, 2000)
  }, delay)
}
//========================//


// LOADER ===================================================//
window.addEventListener('load', async () => {
    try {
        // Esperar a que el video esté listo
        await Promise.all([
        // preloadVideoSafe(),
        preloadImages([
            './img/logo.svg',
            './img/menu.svg',
            './img/close.svg',
            './img/close.png',
        ]),
        (document.fonts?.ready ?? Promise.resolve()) // por la Poppins de Google Fonts
        ])
        //videoFondo.pause()
        videoFondo.play().catch(() => { })
        
        /// Ocultar el preloader
        hideTapa()
        
    } catch (error) {
        console.error('Error en la carga:', error)
        // Incluso si hay error, ocultamos el preloader
        alert('Error al cargar las  imágenes')
        hideTapa()
    }
})
//========================//


// HEADER ===================================================//
let lastScrollY = window.scrollY
const MIN_DELTA = 8

const acordeon = document.querySelector('.acordeon')

window.addEventListener('scroll', () => {
    const rect = acordeon.getBoundingClientRect()

    // si el acordeón está en viewport, no tocar el header
    if (rect.top < window.innerHeight && rect.bottom > 0) return

    const currentScrollY = window.scrollY
    const delta = currentScrollY - lastScrollY

    if (delta > MIN_DELTA && currentScrollY > 100) {
        header.classList.add('hidden')
    } else if (delta < -MIN_DELTA) {
        header.classList.remove('hidden')
    }

    lastScrollY = currentScrollY
})
//========================//


// WHATSAPP FLOTANTE ===================================================//
const SHOW_AT = 100

window.addEventListener('scroll', () => {
    if (window.scrollY > SHOW_AT) {
        wpBtn.classList.add('is-visible')
    } else {
        wpBtn.classList.remove('is-visible')
    }
}, { passive: true })

wpBtn.addEventListener('click', () => {
  const phone = '5491127473093' // +54 9 11 2747-3093
  const text = encodeURIComponent('Hola Nati, estuve viendo web del Dr. Glaria y tengo una consulta:')
  const url = `https://wa.me/${phone}?text=${text}`

  window.open(url, '_blank')
})
//========================//


// MENU ===================================================//
const nav = document.querySelectorAll('.menu a[href^="#"]')

function toggleMenu() {
    menuToggle.classList.toggle('active')
    page.classList.toggle('active')
    header.classList.toggle('active')
    document.body.classList.toggle('no-scroll')
}

menuToggle.addEventListener('click', toggleMenu)

overlay.addEventListener('click', () => {
    // Si el menú está abierto, cerrarlo
    if (page.classList.contains('active')) {
        toggleMenu()
        return
    }

    // Si el menú está cerrado, controlar video y texto
    if (videoFondo.paused) {
        text.classList.add('visible')
        videoFondo.play()
    } else {
        text.classList.remove('visible')
        videoFondo.pause()
    }
})

    
nav.forEach(a => {
    a.addEventListener('click', () => {
        toggleMenu();
    })
})
//========================//


// REPRODUCTOR DE VIDEO ===================================================//

const lastTimeBySrc = new Map()
let currentSrc = null
let cargado = false

verVideo.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        // si hay un video actual, guardo su tiempo
        if (currentSrc) {
            guardarProgreso()
        }

        const src = btn.dataset.video
        if (!src) return
        const poster = btn.dataset.poster
        
        videoCompleto.classList.add('active')
        videoFondo.pause()

        // si cambia el video, limpiar el <video>
        if (currentSrc && currentSrc !== src) {
            cargado = false
            video.pause()
            video.removeAttribute('src')
            video.src = ""              // clave
            video.removeAttribute('poster')
            video.poster = ""           // clave
            video.load()
        }

        currentSrc = src

        if (!cargado) {
            video.poster = poster || ""
            video.src = src
            video.load()

            const lastTime = lastTimeBySrc.get(src) || 0

            video.addEventListener('loadedmetadata', () => {
                cargado = true
                if (lastTime >= 1) video.currentTime = lastTime
                video.play().catch(() => {})
            }, { once: true })
        }
    })
})

function cerrarVideo() {
    if (currentSrc) {
        guardarProgreso()
    }
    video.pause()
    video.removeAttribute('src')
    video.removeAttribute('poster')
    video.load()
    cargado = false
    currentSrc = null
    videoFondo.play().catch(() => {})
    videoCompleto.classList.remove('active')
}

function guardarProgreso() {
    const t = video.currentTime || 0

    if (t < 1) {
        lastTimeBySrc.delete(currentSrc)   // o setear 0 explícito
        return
    }

    lastTimeBySrc.set(currentSrc, t)
}

reproductor.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) cerrarVideo()
})
//========================//


// ACORDEON ===================================================//

const items = document.querySelectorAll('.acordeon .item')
const details = document.querySelectorAll('.acordeon details')

function updateActiveHeight() {
    const activeItem = document.querySelector('.acordeon .item.active')
    if (!activeItem) return

    const container = activeItem.querySelector('.container')

    // cerrar todos los demás (por si quedaron alturas viejas)
    items.forEach(el => {
        if (el !== activeItem) {
        const c = el.querySelector('.container')
        c.style.height = '0px'
        }
    })

    container.style.height = 'auto'
    
    // recalcular el alto real del activo
    requestAnimationFrame(() => {
        const h = container.scrollHeight
        container.style.width = '100%'
        container.style.height = h + 'px'
    })
}


items.forEach(item => {
  item.addEventListener('click', (e) => {
    // si el click fue dentro de details, no togglear el item
   // si clickeaste dentro del details, no cambies de item
    if (e.target.closest('details')) return

    closeAllDetails() // CIERRA TODOS LOS DETAILS

    const isActive = item.classList.contains('active')

    items.forEach(el => {
      el.classList.remove('active')
      const c = el.querySelector('.container')
      c.style.height = '0px'
      c.style.marginBottom = '0px'
    })

    if (isActive) return

    item.classList.add('active')
      updateActiveHeight()
      
      // permitir solo un <details> abierto por vez, incluso dentro del mismo item (const details)
      details.forEach(d => {
        d.addEventListener('toggle', () => {
          if (d.open) closeAllDetails(d)
        })
      })

    setTimeout(() => {
      const rect = item.getBoundingClientRect()
      const isVisible = rect.top >= 40 && rect.bottom <= (window.innerHeight + 100)
      if (!isVisible) item.scrollIntoView({ behavior: 'smooth', block: 'top' })
    }, 200)
  })
})

function closeAllDetails(except = null) {
  document.querySelectorAll('.acordeon details[open]').forEach(d => {
    if (d !== except) d.removeAttribute('open')
  })
}

window.addEventListener('resize', updateActiveHeight) 
//========================//



// CAROUSEL ===================================================//
// CAROUSEL ===================================================//
const carousel = document.querySelector('.carousel');
const track = document.getElementById('track');

if (carousel && track) {

    function setPage(index) {
    const pageCount = Number(getComputedStyle(carousel).getPropertyValue('--pages')) || 1;
    const clamped = Math.max(0, Math.min(pageCount - 1, index));
    carousel.style.setProperty('--index', clamped);
    }

    function getActive() {
        return Number(getComputedStyle(carousel).getPropertyValue('--index')) || 0;
    }

    function regroupSlides(cardsPerSlide) {
    const items = Array.from(track.querySelectorAll('.grid > *'));
    if (!items.length) return;

    track.innerHTML = '';

    for (let i = 0; i < items.length; i += cardsPerSlide) {
        const slide = document.createElement('section');
        slide.className = 'slide';

        const grid = document.createElement('div');
        grid.className = 'grid';

        items.slice(i, i + cardsPerSlide).forEach(el => grid.appendChild(el));
        slide.appendChild(grid);
        track.appendChild(slide);
    }
    }

    function applyResponsiveGrouping() {
    const isMobile = window.matchMedia('(max-width: 880px)').matches;
    regroupSlides(isMobile ? 1 : 3);

    const pageCount = track.querySelectorAll('.slide').length || 1;
    carousel.style.setProperty('--pages', pageCount);

    // si el index quedó fuera de rango tras reagrupar, lo clamp-eo
    setPage(getActive());
    }

    applyResponsiveGrouping();
    window.addEventListener('resize', applyResponsiveGrouping);

    // teclado
    window.addEventListener('keydown', (e) => {
    const active = getActive();
    if (e.key === 'ArrowLeft') setPage(active - 1);
    if (e.key === 'ArrowRight') setPage(active + 1);
    });

    // drag
    let isDragging = false;
    let startX = 0, startY = 0;
    let dx = 0, dy = 0;
    let active = 0;

    const THRESH_PX = 60;
    const EDGE_RESIST = 0.35;

    carousel.style.touchAction = 'pan-y';

    function onPointerDown(e) {
    // si tocás el botón, no draguees
    if (e.target.closest('.js-open-video')) return;

    isDragging = true;
    active = getActive();
    startX = e.clientX;
    startY = e.clientY;
    dx = dy = 0;

    track.style.transition = 'none';
    carousel.setPointerCapture?.(e.pointerId);
    e.preventDefault?.();
    }

    function onPointerMove(e) {
    if (!isDragging) return;

    dx = e.clientX - startX;
    dy = e.clientY - startY;

    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) {
        onPointerUp();
        return;
    }

    const pageCount = Number(getComputedStyle(carousel).getPropertyValue('--pages')) || 1;
    const w = carousel.clientWidth || 1;
    let dragPct = (dx / w) * 100;

    if ((active === 0 && dx > 0) || (active === pageCount - 1 && dx < 0)) {
        dragPct *= EDGE_RESIST;
    }

    const base = -active * (100 / pageCount);
    track.style.transform = `translateX(${base + (dragPct / pageCount)}%)`;
    }

    function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;

    track.style.transition = '';
    const pageCount = Number(getComputedStyle(carousel).getPropertyValue('--pages')) || 1;

    let next = active;
    if (Math.abs(dx) >= THRESH_PX) {
        next = dx < 0 ? Math.min(pageCount - 1, active + 1) : Math.max(0, active - 1);
    }

    setPage(next);
    track.style.transform = '';
    }

    carousel.addEventListener('pointerdown', onPointerDown, { passive: false });
    carousel.addEventListener('pointermove', onPointerMove, { passive: true });
    carousel.addEventListener('pointerup', onPointerUp, { passive: true });
    carousel.addEventListener('pointercancel', onPointerUp, { passive: true });
}