const menuToggle = document.querySelector('.toggle')
const page = document.querySelector('.page')
const tapa = document.querySelector('.tapa')

document.addEventListener("touchstart", () => { }, { passive: true });

// LOADER ===================================================//
function preloadImages(urls) {
    return Promise.all(
        urls.map((url) => new Promise((resolve) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = resolve // resolve igual para no bloquear si falla una imagen
            img.src = url
        }))
    )
}

function hideTapa(delay = 0) {
    setTimeout(() => {
        tapa.classList.add('loaded')
        setTimeout(() => {
            tapa.style.display = 'none'
        }, 2000)
    }, delay)
}

window.addEventListener('load', async () => {
    try {
        await Promise.all([
            preloadImages([
                './img/logo.svg',
                './img/menu.svg',
                './img/close.svg',
                './img/mamas/01/mamas_01_a.webp',
                './img/mamas/01/mamas_01_b.webp',
                './img/mamas/01/mamas_01_c.webp',
                './img/mamas/01/mamas_01_d.webp',
                './img/mamas/01/mamas_01_e.webp',
                './img/mamas/01/mamas_01_f.webp',
                './img/mamas/01/mamas_01_g.webp',
                './img/mamas/01/mamas_01_h.webp',
                './img/mamas/01/mamas_01_i.webp',
                './img/mamas/01/mamas_01_j.webp',
            ]),
            (document.fonts?.ready ?? Promise.resolve())
        ])
        hideTapa()
    } catch (error) {
        console.error('Error en la carga:', error)
        hideTapa()
    }
})
//========================//


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