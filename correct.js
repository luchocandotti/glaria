// REPRODUCTOR DE VIDEO

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
            video.removeAttribute('poster')
            video.load()
        }

        currentSrc = src

        const lastTime = lastTimeBySrc.get(src) || 0

        if (!cargado) {
            if (poster) video.poster = poster
            video.src = src
            video.load()

            video.addEventListener('loadedmetadata', () => {
            cargado = true
            if (lastTime > 0) video.currentTime = lastTime
            video.play().catch(() => {})
            }, { once: true })

            } else {
                video.play().catch(() => {})
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
    lastTimeBySrc.set(currentSrc, video.currentTime || 0)
}

reproductor.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) cerrarVideo()
})