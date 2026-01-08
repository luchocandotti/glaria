
const menuToggle = document.querySelector('.toggle')
const page = document.querySelector('.page')
const text = document.querySelector('.text')
const verVideo = document.querySelector('.btn-pill')
const videoCompleto = document.querySelector('.video-completo')
const reproductor = document.querySelector('.reproductor')
const video = document.getElementById('video-home')
const videoFondo = document.getElementById('video-fondo')
const overlay = document.querySelector('.overlay')
const header = document.querySelector('header')


// verVideo.addEventListener('click', () => {
//     videoCompleto.classList.add('active')
// })

// reproductor.addEventListener('click', () => {
//     videoCompleto.classList.remove('active') //se rompe la animación porqué le da directo opacity: 0
// })

//LOADER
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

// function preloadVideoSafe(timeout = 2000) {
//     return Promise.race([
//         preloadVideo(),
//         new Promise(resolve => setTimeout(resolve, timeout))
//     ])
// }

/// Ocultar tapa con fade
function hideTapa(delay = 0) {
  setTimeout(() => {
        tapa.classList.add('loaded')
        document.body.classList.remove('no-scroll')
    setTimeout(() => {
        tapa.style.display = 'none'
        text.style.opacity = 1
    }, 2000)
  }, delay)
}

// Cargar todo antes de mostrar la web
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
        (document.fonts?.ready ?? Promise.resolve()) // por la Poppins de Google Fonts  [oai_citation:3‡style.css](sediment://file_00000000eeb071f5ad678fadfc472183)
        ])
        
        /// Ocultar el preloader
        hideTapa()
        
    } catch (error) {
        console.error('Error en la carga:', error)
        // Incluso si hay error, ocultamos el preloader después de 3 segundos
        hideTapa()
    }
})

//HEADER
let lastScrollY = window.scrollY
const MIN_DELTA = 8

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY
    const delta = currentScrollY - lastScrollY

    if (delta > MIN_DELTA && currentScrollY > 100) {
        header.classList.add('hidden')
    } else if (delta < -MIN_DELTA) {
        header.classList.remove('hidden')
    }

    lastScrollY = currentScrollY
})

// MENU
let menuOpen = true
const nav = document.querySelectorAll('.menu a[href^="#"]')
const menuHaptic = document.getElementById('menuHaptic')
const menuHapticLabel = document.getElementById('menuHapticLabel')

function toggleMenu() {
    menuToggle.classList.toggle('active')
    page.classList.toggle('active')
    header.classList.toggle('active')
    document.body.classList.toggle('no-scroll')
}

menuToggle.addEventListener('click', toggleMenu)

// overlay.addEventListener('click', () => {
//     if (!page.classList.contains('active')) {
//         if (videoFondo.paused) {
//             videoFondo.play()
//         } else {
//             videoFondo.pause()
//         }
//         return
//     }
//     toggleMenu()
// })

    
nav.forEach(a => {
    a.addEventListener('click', () => {
        toggleMenu();
    })
})

// REPRODUCTOR DE VIDEO
let lastTime = 0
const VIDEO_SRC = 'https://lcandotti.com/glaria/video_home.mp4'
let cargado = false

verVideo.addEventListener('click', () => {
  videoCompleto.classList.add('active');

  if (!cargado) {
    video.src = VIDEO_SRC // recién acá empieza la descarga
    video.load() // fuerza a que el browser lo tome
    cargado = true
      
    // cuando esté listo, saltá al tiempo guardado
    video.addEventListener('loadedmetadata', () => {
        if (lastTime > 0) {
            video.currentTime = lastTime
            video.play()
        }
    }, { once: true })
    
    videoFondo.pause()
  }

//   video.play().catch(() => {
//   })
})

function cerrarVideo() {
    lastTime = video.currentTime
    video.pause()
    video.removeAttribute('src')
    video.load()
    cargado = false
    videoFondo.play()
    videoCompleto.classList.remove('active')
}

reproductor.addEventListener('click', (e) => {
  // Solo si clickeaste el overlay (fondo), no el player
  if (e.target === e.currentTarget) {
    cerrarVideo()
  }
})

//reproductor.addEventListener('click', (e) => e.stopPropagation())