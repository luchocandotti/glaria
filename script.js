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
            './img/whatsapp.svg'
        ]),
        (document.fonts?.ready ?? Promise.resolve()), // por la Poppins de Google Fonts
        loadNav(navPlaceholder, toggleMenu)
        ])

        initDockGeometry() // recién acá el alto de .btn-pill es el real, con Poppins ya cargada

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
import { loadNav } from './nav.js'

const navPlaceholder = document.getElementById('nav-placeholder')

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

// DOCK FLOTANTE (AGENDADOR + WHATSAPP) - UNIFICADO: WP CRECE, AGENDADOR SALE DE SU PROPIO CENTRO ===================================================//
const dockFlotante = document.querySelector('.dock-flotante')
const wpBtn = document.querySelector('.btn-wp')
const agendadorBtn = document.querySelector('.btn-agendador')
const blobConnector = document.getElementById('blob-connector')

// Geometría: NADA hardcodeado. Se mide el btn-pill real (padding 12px 32px) una sola vez al cargar.
let DOCK_W, CAP_R, CY, PILL_W_MIN, BTN_H
let MERGE_HIDE, FADE_RISE_END, FADE_FALL_START, FADE_FALL_END
let dockReady = false

const DURATION = 650

function initDockGeometry() {
    // sacamos btn-wp un instante: así el botón mide EXACTAMENTE como tu .btn-pill base (padding: 12px 32px)
    wpBtn.classList.remove('btn-wp')
    wpBtn.style.width = ''

    const pillRect = wpBtn.getBoundingClientRect()
    wpBtn.classList.add('btn-wp')

    BTN_H = Math.round(pillRect.height)        // alto real de CUALQUIER btn-pill del sistema
    const pillWMax = Math.round(pillRect.width) // ancho real con ícono + "¡Hablemos!"

    CAP_R = BTN_H / 2
    CY = BTN_H / 2
    PILL_W_MIN = BTN_H // wp fusionado = círculo puro, mismo diámetro que el agendador

    const REST_GAP = 8 // única medida "de diseño" que queda: separación estética en reposo
    DOCK_W = BTN_H + REST_GAP + pillWMax

    const D_FINAL = BTN_H + REST_GAP // distancia final entre agendador y la tapa del pill, ya separados
    MERGE_HIDE = D_FINAL * 0.06
    FADE_RISE_END = D_FINAL * 0.22
    FADE_FALL_START = D_FINAL * 0.68
    FADE_FALL_END = D_FINAL

    dockFlotante.style.width = `${DOCK_W}px`
    dockFlotante.style.height = `${BTN_H}px`
    document.querySelector('.dock-blob').setAttribute('viewBox', `0 0 ${DOCK_W} ${BTN_H}`)

    wpBtn.style.height = `${BTN_H}px`
    wpBtn.style.width = `${PILL_W_MIN}px`

    agendadorBtn.style.width = `${BTN_H}px`
    agendadorBtn.style.height = `${BTN_H}px`
    agendadorBtn.style.transform = 'translateX(0)' // arranca fusionado, mismo right:0 que wp

    window.__dockPillWMax = pillWMax // usado por animateDock
    dockReady = true
}

function easeOutBack(t) {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// sin overshoot: para el cierre, evita cruzar el centro de wp
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function getVector(c, angle, offset) {
    const r = offset ?? c.r
    return { x: c.x + Math.cos(angle) * r, y: c.y + Math.sin(angle) * r }
}

// Fórmula clásica de metaballs entre dos círculos (unión orgánica tipo "goo")
function metaballPath(c1, c2, handleSize = 0.68) {
    const d = Math.hypot(c2.x - c1.x, c2.y - c1.y)
    if (d < 1) return ''

    const u1 = d < c1.r + c2.r ? Math.acos((c1.r ** 2 + d ** 2 - c2.r ** 2) / (2 * c1.r * d)) : 0
    const u2 = d < c1.r + c2.r ? Math.acos((c2.r ** 2 + d ** 2 - c1.r ** 2) / (2 * c2.r * d)) : 0

    const angleCenters = Math.atan2(c2.y - c1.y, c2.x - c1.x)
    const maxSpread = Math.acos((c1.r - c2.r) / d)

    const angle1 = angleCenters + u1 + (maxSpread - u1) * handleSize
    const angle2 = angleCenters - u1 - (maxSpread - u1) * handleSize
    const angle3 = angleCenters + Math.PI - u2 - (Math.PI - u2 - maxSpread) * handleSize
    const angle4 = angleCenters - Math.PI + u2 + (Math.PI - u2 - maxSpread) * handleSize

    const p1 = getVector(c1, angle1)
    const p2 = getVector(c1, angle2)
    const p3 = getVector(c2, angle3)
    const p4 = getVector(c2, angle4)

    const totalR = c1.r + c2.r
    const handleLen = Math.min(handleSize, Math.hypot(p1.x - p3.x, p1.y - p3.y) / totalR)

    const p1h = getVector(c1, angle1 - Math.PI / 2, handleLen * c1.r * 1.2)
    const p2h = getVector(c1, angle2 + Math.PI / 2, handleLen * c1.r * 1.2)
    const p3h = getVector(c2, angle3 + Math.PI / 2, handleLen * c2.r * 1.2)
    const p4h = getVector(c2, angle4 - Math.PI / 2, handleLen * c2.r * 1.2)

    return `M ${p1.x} ${p1.y} C ${p1h.x} ${p1h.y} ${p3h.x} ${p3h.y} ${p3.x} ${p3.y} A ${c2.r} ${c2.r} 0 1 0 ${p4.x} ${p4.y} C ${p4h.x} ${p4h.y} ${p2h.x} ${p2h.y} ${p2.x} ${p2.y} A ${c1.r} ${c1.r} 0 1 0 ${p1.x} ${p1.y} Z`
}

let rafId = null

function animateDock(opening, onComplete) {
    if (!dockReady) return
    if (rafId) cancelAnimationFrame(rafId)
    const start = performance.now()
    const pillWMax = window.__dockPillWMax

    function frame(now) {
        const raw = Math.min((now - start) / DURATION, 1)
        const eased = opening ? easeOutBack(raw) : easeInOutCubic(raw)
        const t = opening ? eased : 1 - eased // al cerrar arrancamos abiertos (t=1) y volvemos a fusionar (t=0)

        // wp: crece o encoge entre círculo (BTN_H) y pill completo, anclado a la derecha
        const pillWidth = PILL_W_MIN + (pillWMax - PILL_W_MIN) * t
        wpBtn.style.width = `${pillWidth}px`
        const wpCapX = (DOCK_W - pillWidth) + CAP_R // centro de la tapa izquierda del pill, en vivo

        // agendador: ambos anclados en right:0 — mismo centro en t=0, se separa/vuelve con translateX puro
        const agendadorX = (DOCK_W - CAP_R) + t * (BTN_H - DOCK_W)
        agendadorBtn.style.transform = `translateX(${t * (BTN_H - DOCK_W)}px)`

        // el conector solo existe mientras las dos formas están cerca
        const d = Math.abs(wpCapX - agendadorX)

        if (d < MERGE_HIDE) {
            blobConnector.style.opacity = '0'
        } else {
            const current = { x: agendadorX, y: CY, r: CAP_R }
            const cap = { x: wpCapX, y: CY, r: CAP_R }
            blobConnector.setAttribute('d', metaballPath(current, cap))

            const rise = Math.min(Math.max((d - MERGE_HIDE) / (FADE_RISE_END - MERGE_HIDE), 0), 1)
            const fall = 1 - Math.min(Math.max((d - FADE_FALL_START) / (FADE_FALL_END - FADE_FALL_START), 0), 1)
            blobConnector.style.opacity = String(Math.min(rise, fall))
        }

        if (raw < 1) {
            rafId = requestAnimationFrame(frame)
        } else {
            rafId = null
            if (onComplete) onComplete() // paso 6: recién acá, ya fusionados, se puede pedir el fadeout
        }
    }

    rafId = requestAnimationFrame(frame)
}

const SHOW_AT = 100
const HIDE_NEAR_BOTTOM = 340
const OPACITY_MS = 500 // debe coincidir con la transition de opacity de .dock-flotante en style.css
let dockOpen = false
let dockTimeoutId = null

function openDock() {
    clearTimeout(dockTimeoutId)
    dockFlotante.classList.add('is-visible')       // paso 1: fadeIn, círculo fusionado y quieto
    dockTimeoutId = setTimeout(() => {
        if (dockOpen) animateDock(true)             // paso 2: recién ahí arranca el recorrido
    }, OPACITY_MS)
}

function closeDock() {
    clearTimeout(dockTimeoutId)
    animateDock(false, () => {                      // paso 5: recorrido inverso, opacidad intacta
        if (!dockOpen) dockFlotante.classList.remove('is-visible') // paso 6: fusionados, recién ahí fadeout
    })
}

window.addEventListener('scroll', () => {
    if (!dockReady) return

    const y = window.scrollY
    const vh = window.innerHeight
    const docH = document.documentElement.scrollHeight
    const nearBottom = (y + vh) >= (docH - HIDE_NEAR_BOTTOM)
    const shouldOpen = y > SHOW_AT && !nearBottom

    if (shouldOpen === dockOpen) return
    dockOpen = shouldOpen

    shouldOpen ? openDock() : closeDock()
}, { passive: true })

wpBtn.addEventListener('click', () => {
  const url = getWhatsAppURL()

  window.open(url, '_blank')
})
//========================//

// FIRMA TYPEWRITER ===================================================//
const autorSection = document.getElementById('autor')
const typeEl = document.querySelector('#autor .typewriter')
const cursorEl = document.querySelector('#autor .cursor')

if (autorSection && typeEl && cursorEl) {
    const fullText = typeEl.dataset.text
    let typed = false

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !typed) {
                typed = true
                escribir()
                observer.disconnect()
            }
        })
    }, { threshold: 0.3 })

    observer.observe(autorSection)

    function escribir() {
        cursorEl.classList.add('typing')
        const pausaEn = fullText.indexOf('Candotti') // pausa justo antes de "Candotti"
        let i = 0

        function paso() {
            typeEl.textContent += fullText[i]
            i++

            if (i >= fullText.length) {
                cursorEl.classList.remove('typing')
                cursorEl.classList.add('finishing')
                return
            }

            // delay extra antes de empezar "Candotti"
            const delay = (i === pausaEn) ? 400 : 70
            setTimeout(paso, delay)
        }
        paso()
    }

    // al terminar la animación de salida, limpiar la clase
    // así el hover no la vuelve a disparar al salir
    cursorEl.addEventListener('animationend', (e) => {
        if (e.animationName === 'blink-twice') {
            cursorEl.classList.remove('finishing')
        }
    })
}
//========================//