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
            img.onerror = resolve
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
            ]),
            (document.fonts?.ready ?? Promise.resolve()),
            getGrilla()
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


// HELPERS ===================================================//
const LETRAS = 'abcdefghij'.split('') // máximo 10 imágenes

function cantToLetras(cant) {
    // cant es string en el JSON, lo convertimos a número
    return LETRAS.slice(0, Number(cant))
}
//========================//


// ARMAR LA GRILLA ===================================================//
const CATEGORY_ORDER = {
    mamas: [
        'aumento',
        'mastopexia',
        'reduccion',
        'correccion',
        'transgenero',
        'preserve',
        'axilar-endoscopica',
        'ginecomastia'
    ],
    contorno: [
        'mommy-makeover',
        'lipoabdominoplastia',
        'lipoescultura',
        'brazos',
        'piernas',
        'intima-femenina'
    ]
}

const SUBCATEGORY_LABELS = {
    // Mamas
    aumento:              'Aumento mamario',
    mastopexia:           'Mastopexia estructurada',
    reduccion:            'Reducción mamaria',
    correccion:           'Corrección de cirugía mamaria previa',
    transgenero:          'Cirugía mamaria transgénero',
    preserve:             'Preservé',
    'axilar-endoscopica': 'Aumento mamario por técnica axilar endoscópica',
    ginecomastia:         'Ginecomastia',

    // Contorno
    'mommy-makeover':    'Mommy Makeover',
    lipoabdominoplastia: 'Lipoabdominoplastia 360',
    lipoescultura:       'Lipoescultura 360 Vaser / Microaire / Retraction',
    brazos:              'Cirugía de brazos',
    piernas:             'Cirugía de piernas',
    'intima-femenina':   'Cirugía íntima femenina'
}

function getGrilla() {
    return fetch('carga.json', { cache: 'no-cache' })
        .then(res => res.json())
        .then(data => {
            const imagePromises = []

            Object.entries(CATEGORY_ORDER).forEach(([category, subcategories]) => {
                const contenedor = document.getElementById(`output-${category}`)
                let html = ''

                subcategories.forEach(subcategory => {
                    const casos = data.filter(c => c.category === category && c.subcategory === subcategory)
                    if (casos.length === 0) return // si no hay casos cargados, no renderiza el bloque

                    html += `<h3 class="subcategory-titulo">${SUBCATEGORY_LABELS[subcategory]}</h3>`
                    html += `<div class="grilla-subcategory">`
                    
                    casos.forEach(caso => {
                        const thumbPath = `./img/${caso.category}/${caso.subcategory}/${caso.id}/e.webp`
                        html += `
                            <div class="caso-card" data-id="${caso.id}" data-category="${caso.category}" data-subcategory="${caso.subcategory}" data-cant="${caso.cant}" data-title="${caso.title}" data-descript="${caso.descript}">
                                <img src="${thumbPath}" alt="${caso.title}">
                                <div class="caso-info">
                                    <div class="caso-heading">
                                        <p class="caso-title">${caso.title}</p>
                                    </div>
                                    <p class="caso-descript">${caso.descript}</p>
                                </div>
                            </div>
                        `
                        imagePromises.push(new Promise(resolve => {
                            const img = new Image()
                            img.onload = resolve
                            img.onerror = resolve
                            img.src = thumbPath
                        }))
                    })

                    html += `</div>`
                })

                contenedor.innerHTML = html
            })

            return Promise.all(imagePromises).then(() => {
                bindCardClicks()
            })
        })
}
//========================//


// BIND CLICKS EN LAS CARDS ===================================================//
function bindCardClicks() {
    document.querySelectorAll('.caso-card').forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('activo')) {
                cerrarProyecto()
                return
            }
            document.querySelectorAll('.caso-card').forEach(c => {
                c.classList.remove('activo')
                c.querySelector('.caso-info').classList.remove('activo')
            })
            card.classList.add('activo')
            card.querySelector('.caso-info').classList.add('activo')

            const { id, category, subcategory, cant, title, descript } = card.dataset
            getProject(id, category, subcategory, cant, title, descript)
        })
    })
}
//========================//


// CARGAR PROYECTO ===================================================//
const bajada = document.getElementById('bajada-carousel')

function getProject(id, category, subcategory, cant, title, descript) {
    const letras = cantToLetras(cant)

    // crear o reutilizar el contenedor del proyecto
    let proyectoWrap = document.getElementById('proyecto-wrap')
    if (!proyectoWrap) {
        proyectoWrap = document.createElement('div')
        proyectoWrap.id = 'proyecto-wrap'
        document.getElementById('output-proyecto').appendChild(proyectoWrap)
    }

    // spinner mientras carga
    proyectoWrap.innerHTML = `<div class="loader"><img src="./img/loader.svg" alt=""></div>`
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // SLIDE DOTS ===================================================//
    const SVG_DOT = `<svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10.5" cy="10.5" r="9" stroke-width="1.5"/>
    </svg>`

    function renderDots(cant, activeIndex = 0) {
        const dotsEl = document.getElementById('slide-dots')
        if (!dotsEl) return

        // Primera vez: construir los dots
        if (dotsEl.children.length !== cant) {
            dotsEl.innerHTML = Array.from({ length: cant }, () => `
                <span class="dot">${SVG_DOT}</span>
            `).join('')
        }

        // Siempre: actualizar clase active
        dotsEl.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === activeIndex)
        })
    }
    //========================//
    const imagePromises = []
    const items = letras.map(letra => {
        const src = `./img/${category}/${subcategory}/${id}/${letra}.webp`
        const promise = new Promise(resolve => {
            const img = new Image()
            img.onload = resolve
            img.onerror = resolve
            img.src = src
        })
        imagePromises.push(promise)
        return `<div class="item"><img src="${src}" alt="${title} - ${letra}"></div>`
    })

    const trackMob = proyectoWrap.querySelector('.track-mob')
    if (trackMob) trackMob.scrollLeft = 0

    Promise.all(imagePromises).then(() => {
        setTimeout(() => {
            if ('ontouchstart' in window) {
                proyectoWrap.innerHTML = `
                    <div class="carousel-mob">
                        <div class="track-mob">
                            ${letras.map(letra => `
                                <div class="card-mob">
                                    <img src="./img/${category}/${subcategory}/${id}/${letra}.webp" alt="${title} - ${letra}">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div id="slide-dots"></div>
                    <div class="proyecto-header">
                        <p class="caso-subcategory">${subcategory}</p>
                        <p class="caso-title">${title}</p>
                        <p class="proyecto-descript">${descript}</p>
                        <button class="btn-cerrar-proyecto" id="btn-cerrar">✕ Cerrar</button>
                    </div>
                `

                const trackMob = proyectoWrap.querySelector('.track-mob')
                renderDots(letras.length, 0)

                trackMob.addEventListener('scroll', () => {
                    const index = Math.round(trackMob.scrollLeft / trackMob.offsetWidth)
                    renderDots(letras.length, index)
                }, { passive: true })
            } else {
                proyectoWrap.innerHTML = `
                    <div class="container proyecto-container">
                        ${items.join('')}
                    </div>
                    <div class="proyecto-header">
                        <p class="caso-subcategory">${subcategory}</p>
                        <p class="caso-title">${title}</p>
                        <p class="proyecto-descript">${descript}</p>
                        <button class="btn-cerrar-proyecto" id="btn-cerrar">✕ Cerrar</button>
                    </div>
                `
                bindItemExpand(proyectoWrap.querySelector('.proyecto-container'))

                // desplegar la foto e por defecto
                const itemsDesktop = proyectoWrap.querySelectorAll('.proyecto-container .item')
                itemsDesktop[4]?.click()
            }

            window.scrollTo({ top: 0, behavior: 'smooth' })
            document.getElementById('btn-cerrar').addEventListener('click', cerrarProyecto)

        }, 1000)
    })
}
//========================//

// CERRAR PROYECTO ===================================================//
function cerrarProyecto() {
    document.querySelectorAll('.caso-card').forEach(c => {
        c.classList.remove('activo')
        c.querySelector('.caso-info').classList.remove('activo')
    })
    const proyectoWrap = document.getElementById('proyecto-wrap')
    if (proyectoWrap) proyectoWrap.remove()
}

// CERRAR PROYECTO CON ESC ===========================================//
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('proyecto-wrap')) {
        cerrarProyecto()
    }
})
//========================//


// EXPAND ITEM (igual que el original pero genérico) ===================================================//
function bindItemExpand(container) {
    if (!container) return
    const items = container.querySelectorAll('.item')

    items.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 1280) return

            const total = items.length

            if (item.classList.contains('active')) {
                item.classList.remove('active')
                container.style.gridTemplateColumns = `repeat(${total}, 1fr)`
                container.style.minHeight = ''
            } else {
                items.forEach(i => i.classList.remove('active'))
                item.classList.add('active')
                const cols = Array.from(items)
                    .map(i => i === item ? '12fr' : '1fr')
                    .join(' ')
                container.style.gridTemplateColumns = cols

                // fijar el alto actual como mínimo
                requestAnimationFrame(() => {
                    container.style.minHeight = container.offsetHeight + 'px'
                })
            }
        })
    })

    // flechas de teclado
    document.addEventListener('keydown', (e) => {
        if (window.innerWidth <= 1280) return
        const activeItem = container.querySelector('.item.active')
        if (!activeItem) return

        const allItems = Array.from(items)
        const currentIndex = allItems.indexOf(activeItem)
        let target = null

        if (e.key === 'ArrowRight' && currentIndex < allItems.length - 1) target = allItems[currentIndex + 1]
        else if (e.key === 'ArrowLeft' && currentIndex > 0) target = allItems[currentIndex - 1]

        if (target) target.click()
    })

    // reset en resize
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 1280) {
            items.forEach(i => i.classList.remove('active'))
            container.style.gridTemplateColumns = ''
            container.style.minHeight = ''
        }
    })
    // activar el primer item al cargar
    // items[0].click()
}
//========================//
