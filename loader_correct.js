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
            './img/whatsapp'
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