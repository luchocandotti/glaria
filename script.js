
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
        text.classList.add('visible') // Inicia justo al ocultar la tapa
    }, 2000)
  }, delay)
}

// LOADER
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

//HEADER
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

// MENU
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


//ACORDEON
/*const items = document.querySelectorAll('.acordeon .item')

items.forEach(item => {
  item.addEventListener('click', () => {

    const isActive = item.classList.contains('active')

    // cerrar todos
    items.forEach(el => {
      el.classList.remove('active')
    })

    // si no estaba activo, abrirlo
    if (!isActive) {
      item.classList.add('active')
    }
  })
})*/


/*const items = document.querySelectorAll('.acordeon .item')

items.forEach(item => {
    const container = item.querySelector('.container')

    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active')

        items.forEach(el => {
        el.classList.remove('active')
        const c = el.querySelector('.container')
            c.style.height = '0px'
            c.style.marginBottom = '0px'
        })

        if (!isActive) {
            item.classList.add('active')
            container.style.marginBottom = '20px'

        // dejar que el layout se actualice
        setTimeout(() => {
            const h = container.scrollHeight
            container.style.height = h + 'px'
        }, 0)
        }
    })
})*/

const items = document.querySelectorAll('.acordeon .item')

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
        container.style.marginBottom = '20px'
    })
}

items.forEach(item => {
    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active')
        /*const id = item.id
        if (id) {
            window.location.hash = id
        }*/

        items.forEach(el => {
            el.classList.remove('active')
            const c = el.querySelector('.container')
            c.style.height = '0px'
            c.style.marginBottom = '0px'
        })

        if (isActive) return
        
        item.classList.add('active')
        updateActiveHeight()
        
        // Scroll suave al item
        setTimeout(() => {
        const rect = item.getBoundingClientRect()
        const isVisible = rect.top >= 40 && rect.bottom <= (window.innerHeight +100)
        
        if (!isVisible) {
            item.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'top'
            })
        }
        }, 200)
    })
})

window.addEventListener('resize', updateActiveHeight)
