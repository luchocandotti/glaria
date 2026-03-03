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


// agranda cuando esta en desktop
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

//  limpiar el estilo inline cuando se redimensiona la ventana
window.addEventListener('resize', () => {
    if (window.innerWidth <= 1280) {
        items.forEach(i => i.classList.remove('active'))
        document.querySelectorAll('#resultados .container').forEach(c => {
            c.style.gridTemplateColumns = ''  // elimina el estilo inline
        })
    }
})