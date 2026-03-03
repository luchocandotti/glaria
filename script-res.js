const menuToggle = document.querySelector('.toggle')
const page = document.querySelector('.page')

document.addEventListener("touchstart", () => {}, { passive: true });


// MENU ===================================================//
const nav = document.querySelectorAll('.menu a[href^="#"]')

function toggleMenu() {
    menuToggle.classList.toggle('active')
    page.classList.toggle('active')
    document.body.classList.toggle('no-scroll')
}

menuToggle.addEventListener('click', toggleMenu)

    
nav.forEach(a => {
    a.addEventListener('click', () => {
        toggleMenu();
    })
})
//========================//


// AGRANDA FOTO EN DESKTOP ===================================================//
const items = document.querySelectorAll('#resultados .container .item')

items.forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 1280) return  // 👈 sale si es mobile

        const container = item.closest('.container')
        const total = container.querySelectorAll('.item').length

        if (item.classList.contains('active')) {
            // deseleccionar
            item.classList.remove('active')
            container.style.gridTemplateColumns = `repeat(${total}, 1fr)`
        } else {
            // activar este
            items.forEach(i => i.classList.remove('active'))
            item.classList.add('active')
            const cols = Array.from(container.querySelectorAll('.item'))
                .map(i => i === item ? '12fr' : '1fr')  // 👈 solo este valor
                .join(' ')
            container.style.gridTemplateColumns = cols
        }
    })
})

// NAVEGACIÓN CON FLECHAS DEL TECLADO ===================================================//
document.addEventListener('keydown', (e) => {
    if (window.innerWidth <= 1280) return

    const activeItem = document.querySelector('#resultados .container .item.active')
    if (!activeItem) return

    const container = activeItem.closest('.container')
    const allItems = Array.from(container.querySelectorAll('.item'))
    const currentIndex = allItems.indexOf(activeItem)

    let targetItem = null

    if (e.key === 'ArrowRight' && currentIndex < allItems.length - 1) {
        targetItem = allItems[currentIndex + 1]
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        targetItem = allItems[currentIndex - 1]
    }

    if (targetItem) targetItem.click()
})
//========================//

//  limpiar el estilo inline cuando se redimensiona la ventana
window.addEventListener('resize', () => {
    if (window.innerWidth <= 1280) {
        items.forEach(i => i.classList.remove('active'))
        document.querySelectorAll('#resultados .container').forEach(c => {
            c.style.gridTemplateColumns = ''  // elimina el estilo inline
        })
    }
})