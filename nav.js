export function bindMenuLinks(toggleMenu) {
    const nav = document.querySelectorAll('.menu a[href^="#"]')
    nav.forEach(a => {
        a.addEventListener('click', () => {
            toggleMenu()
        })
    })
}

export function loadNav(navPlaceholder, toggleMenu) {
    return fetch('nav.html')
        .then(res => res.text())
        .then(html => {
            navPlaceholder.innerHTML = html
            bindMenuLinks(toggleMenu)
        })
}