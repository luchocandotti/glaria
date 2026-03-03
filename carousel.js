// ============================================
// CAROUSEL LIMPIO
// ============================================
const carousel = document.querySelector('.carousel')
const track = document.querySelector('.track')

let isDragging = false
let startX
let scrollLeft

// Función helper para calcular ancho de card + gap
function getCardWidth() {
    const card = document.querySelector('.card')
    const cardWidth = Math.round(card.getBoundingClientRect().width) + 24
    return cardWidth
}

// Función que snapea a la card más cercana
function snapToNearestCard() {
    const cardPlusGap = getCardWidth()
    const scrollPosition = track.scrollLeft
    const cardIndex = Math.round(scrollPosition / cardPlusGap)
    
    track.scrollTo({
        left: cardIndex * cardPlusGap,
        behavior: 'smooth'
    })
}

// ============================================
// DRAG (solo mobile via CSS)
// ============================================


// Cuando presiona
track.addEventListener('mousedown', (e) => {
    // Solo permite drag si NO clickeaste un botón
    if (e.target.closest('.btn-pill, .js-open-video')) return

    isDragging = true
    startX = e.pageX
    scrollLeft = track.scrollLeft
})

// Cuando mueve
track.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    
    const x = e.pageX                    // 👈 Posición actual del mouse en X
    const walk = startX - x              // 👈 AQUÍ: cuánto se movió desde el inicio
    track.scrollLeft = scrollLeft + walk // 👈 Aplica ese movimiento al scroll
})

// Cuando suelta
track.addEventListener('mouseup', () => {
    if (isDragging) {
        snapToNearestCard()
    }
    isDragging = false
})

// Si el mouse sale del área
track.addEventListener('mouseleave', () => {
    if (isDragging) {
        snapToNearestCard()
    }
    isDragging = false
})

// ============================================
// NAVEGACIÓN CON FLECHAS
// ============================================
const navLeft = document.querySelector('.nav-left')
const navRight = document.querySelector('.nav-right')
const totalCards = document.querySelectorAll('.card').length - 2

let cardPoint = 1

navLeft.addEventListener('click', () => {
    track.scrollBy({
        left: -getCardWidth(),
        behavior: 'smooth'
    })
    if (cardPoint > 1) {
        cardPoint--
    } 
    resetNav()
})

navRight.addEventListener('click', () => {
    track.scrollBy({
        left: getCardWidth(),
        behavior: 'smooth'
    })
    if (cardPoint < totalCards) {
        cardPoint++
    }
    resetNav()
})

function resetNav() {
    if (cardPoint > 1 && cardPoint < totalCards) {
        navLeft.classList.remove('inactive')
        navRight.classList.remove('inactive')
    } else if (cardPoint == 1) {
        navLeft.classList.add('inactive')
    } else if (cardPoint == totalCards) {
        navRight.classList.add('inactive')
    }
    console.log(cardPoint)
}