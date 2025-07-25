import calculateRouteDistance from './CalculateRouteDistance'
import FeatureTypes from './FeatureTypes'
import ymapsIcon from '../assets/ymaps.svg'
import twoGisIcon from '../assets/2gis.png'
import shareIcon from '../assets/share.svg'

export default function createPopupContent(feature, layer) {
    const { type, name, description, id } = feature.properties ?? {}
    const coordinates = feature.geometry.coordinates
    const isPoint = feature.geometry.type === 'Point'
    const webShareSupported = 'canShare' in navigator

    let content = []
    if (type && FeatureTypes[type]) {
        content.push(`<span class="text-gray-500">${FeatureTypes[type].name}</span> `)
    }
    if (name) {
        content.push(`&laquo;<span class="font-bold">${name}</span>&raquo;`)
    }
    if (description) {
        content.push(`<div>${description}</div>`)
    }
    if (isPoint) {
        content.push('<div class="mt-2 flex flex-wrap gap-2">')
        content.push(
            `<a href="https://yandex.ru/maps/?rtext=~${coordinates[1]},${coordinates[0]}&rtt=sc" target="_blank" class="text-nowrap">
                <img src="${ymapsIcon}" class="max-w-4 max-h-4 inline" />
                Я.Карты
            </a>`,
        )
        // На компьютере используем пешие маршруты, на мобильном - скутерные
        const isMobile2GisType = window.innerWidth <= 800 ? 'scooter' : 'pedestrian'
        content.push(
            `<a href="https://2gis.kz/directions/tab/${isMobile2GisType}/points/|${coordinates[0]},${coordinates[1]}" target="_blank" class="text-nowrap">
                <img src="${twoGisIcon}" class="max-w-4 max-h-4 inline" />
                2GIS
            </a>`,
        )
        if (webShareSupported) {
            content.push(
                `<a href="${window.location.origin}${window.location.pathname}#${type}=${id}" target="_blank" class="text-nowrap js-share">
                    <img src="${shareIcon}" class="max-w-4 max-h-4 inline" />
                    Поделиться
                </a>`,
            )
        }
        content.push('</div>')
    }
    layer.bindPopup(content.join(''))

    layer.on('popupopen', (e) => {
        if (['point', 'socket', 'route'].includes(type) === false) return

        window.history.replaceState(null, '', `#${type}=${e.target.feature.properties.id}`)

        e.target._popup._container.querySelectorAll('.js-share').forEach((el) => {
            el.addEventListener('click', async (event) => {
                event.preventDefault()
                const url = event.target.getAttribute('href')

                const webShareSupported = 'canShare' in navigator
                if (!webShareSupported) return

                if (navigator.canShare()) {
                    try {
                        await navigator.share({ url })
                    } catch (err) {
                        console.error(err)
                    }
                } else {
                    const oldText = event.target.innerHTML
                    try {
                        await navigator.clipboard.writeText(url)
                    } catch (error) {
                        console.error(error)
                    }
                    event.target.innerHTML = 'Скопировано!'
                    setTimeout(() => {
                        event.target.innerHTML = oldText
                    }, 2000)
                }
            })
        })
    })
    layer.on('popupclose', (e) => window.history.replaceState(null, '', `#`))
}
