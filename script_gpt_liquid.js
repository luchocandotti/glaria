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

const DURATION = 900

function initDockGeometry() {
    // el agendador es ahora el pill con texto: se mide tal cual el sistema de btn-pill
    const previousTransform = agendadorBtn.style.transform

    agendadorBtn.style.transform = 'none'
    agendadorBtn.classList.remove('btn-agendador')
    agendadorBtn.style.width = 'auto'

    const pillRect = agendadorBtn.getBoundingClientRect()

    agendadorBtn.classList.add('btn-agendador')
    agendadorBtn.style.transform = previousTransform

    BTN_H = Math.round(pillRect.height)        // alto real de CUALQUIER btn-pill del sistema
    const pillWMax = Math.round(pillRect.width) // ancho real con ícono + "Agendar"

    CAP_R = BTN_H / 2
    CY = BTN_H / 2
    PILL_W_MIN = BTN_H // agendador fusionado = círculo puro, mismo diámetro que wp

    const REST_GAP = 8 // única medida "de diseño" que queda: separación estética en reposo
    DOCK_W = BTN_H + REST_GAP + pillWMax

    const D_FINAL = BTN_H + REST_GAP // distancia final entre wp y la tapa del pill, ya separados
    MERGE_HIDE = D_FINAL * 0.06
    FADE_RISE_END = D_FINAL * 0.22
    FADE_FALL_START = D_FINAL * 0.68
    FADE_FALL_END = D_FINAL

    dockFlotante.style.width = `${DOCK_W}px`
    dockFlotante.style.height = `${BTN_H}px`
    document.querySelector('.dock-blob').setAttribute('viewBox', `0 0 ${DOCK_W} ${BTN_H}`)

    agendadorBtn.style.height = `${BTN_H}px`
    agendadorBtn.style.width = `${PILL_W_MIN}px`

    wpBtn.style.width = `${BTN_H}px`
    wpBtn.style.height = `${BTN_H}px`
    wpBtn.style.transform = 'translateX(0)' // arranca fusionado, mismo right:0 que el pill

    window.__dockPillWMax = pillWMax
    dockReady = true
    // Mantener el estado visual actual cuando se recalcula
    // por resize, rotación o cambio de fuente.
    renderDock(dockProgress)
}

function easeOutBack(t) {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

// Agregar helpers nuevos
function clamp(value, min = 0, max = 1) {
    return Math.min(Math.max(value, min), max)
}
function lerp(start, end, t) {
    return start + (end - start) * t
}
function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / (edge1 - edge0))
    return t * t * (3 - 2 * t)
}


// Silueta líquida con cuello central y concavidad progresiva
function liquidBridgePath(c1, c2, pinch = 0) {
    const left = c1.x <= c2.x ? c1 : c2
    const right = c1.x <= c2.x ? c2 : c1

    const dx = right.x - left.x
    const dy = right.y - left.y
    const distance = Math.hypot(dx, dy)

    if (distance <= 1) return ''

    const ux = dx / distance
    const uy = dy / distance

    /*
     * Vector perpendicular al eje entre centros.
     */
    const nx = -uy
    const ny = ux

    const t = clamp(pinch)
    const radius = Math.min(left.r, right.r)

    /*
     * Ángulo de contacto sobre la circunferencia.
     *
     * Al principio el puente abraza mucho ambos cuerpos.
     * Cerca de la separación, los puntos se acercan al eje.
     */
    const attachmentAngle = lerp(
        Math.PI * 0.39,
        Math.PI * 0.16,
        t
    )

    const cosA = Math.cos(attachmentAngle)
    const sinA = Math.sin(attachmentAngle)

    /*
     * Puntos reales sobre cada círculo.
     */
    const leftTop = {
        x: left.x + ux * cosA * left.r + nx * sinA * left.r,
        y: left.y + uy * cosA * left.r + ny * sinA * left.r
    }

    const leftBottom = {
        x: left.x + ux * cosA * left.r - nx * sinA * left.r,
        y: left.y + uy * cosA * left.r - ny * sinA * left.r
    }

    const rightTop = {
        x: right.x - ux * cosA * right.r + nx * sinA * right.r,
        y: right.y - uy * cosA * right.r + ny * sinA * right.r
    }

    const rightBottom = {
        x: right.x - ux * cosA * right.r - nx * sinA * right.r,
        y: right.y - uy * cosA * right.r - ny * sinA * right.r
    }

    /*
     * Tangentes reales en los puntos de contacto.
     *
     * Esto elimina el quiebre entre círculo y puente.
     */
    const leftTopTangent = {
        x: ux * sinA - nx * cosA,
        y: uy * sinA - ny * cosA
    }

    const leftBottomTangent = {
        x: ux * sinA + nx * cosA,
        y: uy * sinA + ny * cosA
    }

    const rightTopTangent = {
        x: ux * sinA + nx * cosA,
        y: uy * sinA + ny * cosA
    }

    const rightBottomTangent = {
        x: ux * sinA - nx * cosA,
        y: uy * sinA - ny * cosA
    }

    const middleX = (left.x + right.x) / 2
    const middleY = (left.y + right.y) / 2

    /*
     * Cuello más robusto.
     *
     * Empieza en 74% del radio y recién al final baja
     * a un valor muy pequeño.
     */
    const neckHalf = lerp(
        radius * 0.82,
        0.75,
        Math.pow(t, 2.1)
    )

    const neckTop = {
        x: middleX + nx * neckHalf,
        y: middleY + ny * neckHalf
    }

    const neckBottom = {
        x: middleX - nx * neckHalf,
        y: middleY - ny * neckHalf
    }

    const bridgeSpan = Math.max(
        1,
        Math.hypot(
            rightTop.x - leftTop.x,
            rightTop.y - leftTop.y
        )
    )

    /*
     * Controles largos al principio para una forma ancha
     * y densa. Cerca del corte se acortan.
     */
    const circleHandle = bridgeSpan * lerp(
        0.34,
        0.18,
        t
    )

    const neckHandle = bridgeSpan * lerp(
        0.20,
        0.07,
        t
    )

    const leftTopControl = {
        x: leftTop.x + leftTopTangent.x * circleHandle,
        y: leftTop.y + leftTopTangent.y * circleHandle
    }

    const leftBottomControl = {
        x: leftBottom.x + leftBottomTangent.x * circleHandle,
        y: leftBottom.y + leftBottomTangent.y * circleHandle
    }

    const rightTopControl = {
        x: rightTop.x - rightTopTangent.x * circleHandle,
        y: rightTop.y - rightTopTangent.y * circleHandle
    }

    const rightBottomControl = {
        x: rightBottom.x - rightBottomTangent.x * circleHandle,
        y: rightBottom.y - rightBottomTangent.y * circleHandle
    }

    const neckTopLeftControl = {
        x: neckTop.x - ux * neckHandle,
        y: neckTop.y - uy * neckHandle
    }

    const neckTopRightControl = {
        x: neckTop.x + ux * neckHandle,
        y: neckTop.y + uy * neckHandle
    }

    const neckBottomLeftControl = {
        x: neckBottom.x - ux * neckHandle,
        y: neckBottom.y - uy * neckHandle
    }

    const neckBottomRightControl = {
        x: neckBottom.x + ux * neckHandle,
        y: neckBottom.y + uy * neckHandle
    }

    return `
        M ${leftTop.x} ${leftTop.y}

        C
        ${leftTopControl.x} ${leftTopControl.y}
        ${neckTopLeftControl.x} ${neckTopLeftControl.y}
        ${neckTop.x} ${neckTop.y}

        C
        ${neckTopRightControl.x} ${neckTopRightControl.y}
        ${rightTopControl.x} ${rightTopControl.y}
        ${rightTop.x} ${rightTop.y}

        L
        ${rightBottom.x} ${rightBottom.y}

        C
        ${rightBottomControl.x} ${rightBottomControl.y}
        ${neckBottomRightControl.x} ${neckBottomRightControl.y}
        ${neckBottom.x} ${neckBottom.y}

        C
        ${neckBottomLeftControl.x} ${neckBottomLeftControl.y}
        ${leftBottomControl.x} ${leftBottomControl.y}
        ${leftBottom.x} ${leftBottom.y}

        Z
    `
}

let rafId = null

// Estado visual persistente.
// Permite invertir la animación sin saltos.
let dockProgress = 0
let dockTarget = 0
let dockVelocity = 0
let lastFrameTime = null

// Física secundaria para el cierre y los cambios bruscos.
// La apertura conserva easeOutBack().
const DOCK_STIFFNESS = 190
const DOCK_DAMPING = 26

const reduceMotionQuery = {
    matches: false
}


function renderDock(progress) {
    if (!dockReady) return
    const pillWMax = window.__dockPillWMax
    /*
     * progress puede superar 1 durante easeOutBack().
     * Para posición y ancho conservamos ese rebote.
     * Para deformaciones y metaball usamos una versión limitada,
     * evitando geometrías inválidas.
     */
    const motionT = progress
    const shapeT = clamp(progress)
    /*
     * El pill empieza a crecer ligeramente después
     * de que el círculo comienza a desplazarse.
     */
    const expansionT = smoothstep(0.08, 0.82, shapeT)
    /*
     * Intensidad máxima de deformación en el centro
     * de la transición. En los extremos vuelve a cero.
     */
    const strain = Math.sin(Math.PI * shapeT)
    /*
     * Deformación muy leve del círculo:
     * se alarga hacia el cuello y se comprime verticalmente.
     */
    const wpScaleX = 1 + strain * 0.055
    const wpScaleY = 1 - strain * 0.032
    /*
     * El ancho conserva el pequeño overshoot de easeOutBack,
     * pero evitamos que pueda reducirse por debajo del círculo.
     */
    const pillWidth = Math.max(
        PILL_W_MIN,
        PILL_W_MIN + (pillWMax - PILL_W_MIN) * expansionT
    )
    agendadorBtn.style.width = `${pillWidth}px`
    /*
     * Centro de la tapa izquierda del pill.
     */
    const pillCapX = (DOCK_W - pillWidth) + CAP_R
    /*
     * Movimiento del WhatsApp.
     * Acá se conserva motionT sin clamp para mantener el rebote.
     */
    const translateX = motionT * (BTN_H - DOCK_W)
    const wpX = (DOCK_W - CAP_R) + translateX

    wpBtn.style.transform = `
        translateX(${translateX}px)
        scale(${wpScaleX}, ${wpScaleY})
    `
    /*
     * El pill también se deforma apenas en sentido inverso.
     * La deformación es menor para que el texto no se distorsione.
     */
    const pillScaleX = 1 + strain * 0.012
    const pillScaleY = 1 - strain * 0.018
    agendadorBtn.style.transform = `
        scale(${pillScaleX}, ${pillScaleY})
    `
    /*
     * Distancia física entre centros.
     */
    const distance = Math.abs(pillCapX - wpX)
    /*
     * Compresión radial mínima en la zona de máxima tensión.
     * Esto afina el cuello sin hacer desaparecer las masas.
     */
    const radiusCompression = 1 - strain * 0.035
    const effectiveRadius = CAP_R * radiusCompression
    /*
     * El cuello empieza más redondo y se vuelve más tenso
     * a medida que aumenta la separación.
     */
    const separationT = smoothstep(
    MERGE_HIDE,
    FADE_FALL_END,
    distance
    )
    /*
    * El estrangulamiento empieza tarde.
    * Primero el puente se estira; luego aparece el cuello.
    */
    const pinchT = smoothstep(
        0.22,
        0.96,
        separationT
    )
    /*
     * Ocultar solamente cuando ambas masas están prácticamente
     * superpuestas o cuando ya se separaron por completo.
     */
    const rupturePoint = FADE_FALL_END * 0.992

    if (
        distance < MERGE_HIDE ||
        distance >= rupturePoint
    ) {
        blobConnector.style.opacity = '0'
        blobConnector.setAttribute('d', '')
        return
    }
    const currentCircle = {
        x: wpX,
        y: CY,
        r: effectiveRadius
    }
    const pillCap = {
        x: pillCapX,
        y: CY,
        r: effectiveRadius
    }
    const path = liquidBridgePath(
        currentCircle,
        pillCap,
        pinchT
    )
    
    blobConnector.setAttribute('d', path)
    /*
     * El conector conserva casi toda su opacidad.
     * Sólo aparece suavemente al salir de la superposición
     * y desaparece en los últimos píxeles para evitar aliasing.
     */
    const appear = smoothstep(
        MERGE_HIDE,
        FADE_RISE_END,
        distance
    )
    /*
    * Sólo reducimos opacidad en los últimos píxeles,
    * para suavizar el corte subpíxel.
    */
    const finalFadeStart = rupturePoint - 0.45

    const finalFade = 1 - smoothstep(
        finalFadeStart,
        rupturePoint,
        distance
    )
    blobConnector.style.opacity = String(
        Math.min(appear, finalFade)
    )
}

function animateDock(opening, onComplete) {
    if (!dockReady) return
    dockTarget = opening ? 1 : 0
    if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = null
    }
    /*
     * La apertura conserva exactamente el concepto easeOutBack:
     * parte desde el progreso visual actual y llega a 1 con rebote.
     */
    if (opening) {
        const startProgress = dockProgress
        const startTime = performance.now()

        function openingFrame(now) {
            const raw = clamp(
                (now - startTime) / DURATION
            )
            const eased = easeOutBack(raw)
            dockProgress = lerp(
                startProgress,
                1,
                eased
            )
            renderDock(dockProgress)
            if (
                raw < 1 &&
                dockTarget === 1
            ) {
                rafId = requestAnimationFrame(openingFrame)
                return
            }
            /*
             * Si cambió el objetivo mientras abría,
             * continuar desde el estado visual actual.
             */
            if (dockTarget === 0) {
                rafId = null
                animateDock(false, onComplete)
                return
            }
            dockProgress = 1
            dockVelocity = 0
            rafId = null
            renderDock(dockProgress)

            if (onComplete) onComplete()
        }

        rafId = requestAnimationFrame(openingFrame)
        return
    }

    /*
     * El cierre usa un resorte amortiguado.
     * Esto mantiene continuidad y evita saltos si el scroll
     * cambia de dirección durante la animación.
     */
    lastFrameTime = null

    function closingFrame(now) {
        if (lastFrameTime === null) {
            lastFrameTime = now
        }
        const dt = Math.min(
            (now - lastFrameTime) / 1000,
            0.032
        )
        lastFrameTime = now
        const displacement = dockTarget - dockProgress
        const acceleration =
            displacement * DOCK_STIFFNESS -
            dockVelocity * DOCK_DAMPING
        dockVelocity += acceleration * dt
        dockProgress += dockVelocity * dt
        renderDock(dockProgress)
        const settled =
            Math.abs(dockTarget - dockProgress) < 0.001 &&
            Math.abs(dockVelocity) < 0.01
        if (
            !settled &&
            dockTarget === 0
        ) {
            rafId = requestAnimationFrame(closingFrame)
            return
        }
        /*
         * Si durante el cierre se pidió volver a abrir,
         * se retoma la apertura desde el progreso actual.
         */
        if (dockTarget === 1) {
            rafId = null
            animateDock(true, onComplete)
            return
        }
        dockProgress = 0
        dockVelocity = 0
        lastFrameTime = null
        rafId = null
        renderDock(dockProgress)
        if (onComplete) onComplete()
    }
    rafId = requestAnimationFrame(closingFrame)
}

let dockResizeTimeout = null
function refreshDockGeometry() {
    clearTimeout(dockResizeTimeout)
    dockResizeTimeout = setTimeout(() => {
        if (!dockReady) return
        if (rafId) {
            cancelAnimationFrame(rafId)
            rafId = null
        }
        initDockGeometry()
        if (dockTarget !== dockProgress) {
            animateDock(dockTarget === 1)
        }
    }, 100)
}
window.addEventListener(
    'resize',
    refreshDockGeometry,
    { passive: true }
)
window.addEventListener(
    'orientationchange',
    refreshDockGeometry,
    { passive: true }
)

const SHOW_AT = 100
const HIDE_NEAR_BOTTOM = 340
const OPACITY_MS = 500 // debe coincidir con la transition de opacity de .dock-flotante en style.css
let dockOpen = false
let dockTimeoutId = null

function openDock() {
    clearTimeout(dockTimeoutId)
    dockTarget = 1
    dockFlotante.classList.add('is-visible')
    /*
     * Si ya estaba parcialmente visible, no esperar otro fade completo.
     * Retomar inmediatamente desde el estado actual.
     */
    if (dockProgress > 0.01) {
        animateDock(true)
        return
    }
    dockTimeoutId = setTimeout(() => {
        if (!dockOpen) return
        animateDock(true)
    }, OPACITY_MS)
}

function closeDock() {
    clearTimeout(dockTimeoutId)
    dockTarget = 0
    /*
     * Si todavía no comenzó a abrirse, basta con ocultarlo.
     */
    if (dockProgress <= 0.001) {
        dockProgress = 0
        dockVelocity = 0
        renderDock(0)
        if (!dockOpen) {
            dockFlotante.classList.remove('is-visible')
        }
        return
    }
    animateDock(false, () => {
        if (!dockOpen) {
            dockFlotante.classList.remove('is-visible')
        }
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