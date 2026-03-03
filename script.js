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
            './img/glaria_perfil.jpg',
            './img/play-circle.svg',
            './img/asoc_01.svg',
            './img/asoc_02.svg',
            './img/asoc_03.svg',
            './img/asoc_04.svg',
            './img/instagram.svg',
            './img/youtube.svg',
            './img/tiktok.svg',
            './img/google.svg',
            './img/whatsapp.svg'
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

    // si .acordeón está en viewport, no tocar el header
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

        console.log("BTN:", btn);
        console.log("data-poster raw:", btn.getAttribute("data-poster"));
        console.log("dataset.poster:", btn.dataset.poster);
        console.log("poster resolved:", new URL(btn.dataset.poster, location.href).href);

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


// ============================================
// CAROUSEL LIMPIO
// ============================================
const carousel = document.querySelector('.carousel')
const track = document.querySelector('.track')

let isDragging = false
let startX
let scrollLeft

// Ancho de una card + su gap
function getCardWidth() {
    const card = document.querySelector('.card')
    return Math.round(card.getBoundingClientRect().width) + 24
}

// Cuántas cards caben visibles a la vez
function getVisibleCount() {
    return Math.round(track.offsetWidth / getCardWidth())
}

// Total de cards reales
function getTotalCards() {
    return document.querySelectorAll('.card').length
}

// Índice de la card actual (0-based) derivado del scroll real
function getCurrentIndex() {
    return Math.round(track.scrollLeft / getCardWidth())
}

// Card index máximo al que se puede scrollear
function getMaxIndex() {
    return getTotalCards() - getVisibleCount()
}

// Snapea a la card más cercana
function snapToNearestCard() {
    track.scrollTo({
        left: getCurrentIndex() * getCardWidth(),
        behavior: 'smooth'
    })
}

// Actualiza estado de las flechas según posición real del scroll
function resetNav() {
    const idx = getCurrentIndex()
    const max = getMaxIndex()
    navLeft.classList.toggle('inactive', idx <= 0)
    navRight.classList.toggle('inactive', idx >= max)
}

// ============================================
// DRAG (desktop)
// ============================================
track.addEventListener('mousedown', (e) => {
    if (e.target.closest('.btn-pill, .js-open-video')) return
    isDragging = true
    startX = e.pageX
    scrollLeft = track.scrollLeft
})

track.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    track.scrollLeft = scrollLeft + (startX - e.pageX)
})

track.addEventListener('mouseup', () => {
    if (isDragging) snapToNearestCard()
    isDragging = false
})

track.addEventListener('mouseleave', () => {
    if (isDragging) snapToNearestCard()
    isDragging = false
})

// ============================================
// NAVEGACIÓN CON FLECHAS
// ============================================
const navLeft = document.querySelector('.nav-left')
const navRight = document.querySelector('.nav-right')

navLeft.addEventListener('click', () => {
    track.scrollBy({ left: -getCardWidth(), behavior: 'smooth' })
    // Leer estado después de que el scroll arranque
    setTimeout(resetNav, 50)
})

navRight.addEventListener('click', () => {
    track.scrollBy({ left: getCardWidth(), behavior: 'smooth' })
    setTimeout(resetNav, 50)
})

// Sincroniza flechas si el usuario scrollea manualmente (touch/drag)
track.addEventListener('scrollend', resetNav)

// Estado inicial
resetNav()
//========================//

// OFUSCACIÓN DEL NÚMERO ===================================================//
// Número dividido y al revés para confundir bots
const partes = ['3093', '2747', '11', '549']
const numeroCompleto = partes.reverse().join('')
const wpText = encodeURIComponent('Hola Nati, estuve viendo web del Dr. Glaria y tengo una consulta:')

// Configurar el enlace visible
const linkWp = document.getElementById('link-wp');
const numeroVisible = document.getElementById('numero-visible')

const getWhatsAppURL = () => `https://wa.me/${numeroCompleto}?text=${wpText}`

linkWp.href = getWhatsAppURL()
numeroVisible.textContent = '+54 11 2747 3093'

// WHATSAPP FLOTANTE ===================================================//
const wpBtn = document.querySelector('.btn-wp')
const SHOW_AT = 100
const HIDE_NEAR_BOTTOM = 100

window.addEventListener('scroll', () => {
    const y = window.scrollY
    const vh = window.innerHeight
    const docH = document.documentElement.scrollHeight

    const nearBottom = (y + vh) >= (docH - HIDE_NEAR_BOTTOM)
    
    if (y > SHOW_AT && !nearBottom) {
        wpBtn.classList.add('is-visible')
    } else {
        wpBtn.classList.remove('is-visible')
    }
}, { passive: true })

wpBtn.addEventListener('click', () => {
  const url = getWhatsAppURL()

  window.open(url, '_blank')
})
//========================//