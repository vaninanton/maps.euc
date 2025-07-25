import FeatureTypes from './FeatureTypes'
import ymapsIcon from '../assets/ymaps.svg'
import twoGisIcon from '../assets/2gis.png'
import shareIcon from '../assets/share.svg'

function createTooltipContent(feature) {
    const { type, name, description } = feature.properties ?? {}
    const typeText = type && FeatureTypes[type] ? FeatureTypes[type]?.name + ' ' : ''
    const nameText = name ? `<span class="font-bold">${name}</span>` : ''

    let distText = ''
    if (feature.properties.type === 'route') {
        let dist = 0
        for (let i = 1; i < feature.geometry.coordinates.length; i++) {
            dist += L.latLng(feature.geometry.coordinates[i]).distanceTo(L.latLng(feature.geometry.coordinates[i - 1]))
        }
        dist = dist / 1000 // в км
        distText = `<span class="text-xs text-gray-500">(${dist.toFixed(1)} км)</span>`
    }

    return typeText + nameText + distText
}

function createPopupContent(feature) {
    const { type, name, description, id } = feature.properties ?? {}
    const coordinates = feature.geometry.coordinates
    const isPoint = feature.geometry.type === 'Point'
    const webShareSupported = 'canShare' in navigator
    const isMobile2GisType = window.innerWidth <= 800 ? 'scooter' : 'pedestrian'

    const content = [
        type && FeatureTypes[type] ? `<span>${FeatureTypes[type]?.name}</span> ` : '',
        name ? `&laquo;<span class="font-bold">${name}</span>&raquo;` : '',
        description ? `<div>${description}</div>` : '',
        isPoint ? '<div class="mt-4 font-bold">Маршрут:</div>' : '',
        isPoint ? '<div class="flex gap-2">' : '',
        isPoint
            ? `<a href="https://yandex.ru/maps/?rtext=~${coordinates[1]},${coordinates[0]}&rtt=sc" target="_blank"><img src="${ymapsIcon}" class="w-4 h-4 inline" />  Яндекс.Карты</a>`
            : '',
        isPoint
            ? `<a href="https://2gis.kz/directions/tab/${isMobile2GisType}/points/|${coordinates[0]},${coordinates[1]}" target="_blank"><img src="${twoGisIcon}" class="w-4 h-4 inline" /> 2GIS</a>`
            : '',
        isPoint && webShareSupported
            ? `<a href="${window.location.origin}${window.location.pathname}#${type}=${id}" target="_blank" class="js-share"><img src="${shareIcon}" class="w-4 h-4 inline" /> Поделиться</a>`
            : '',
        isPoint ? '</div>' : '',
    ]

    return content.join('')
}

export default function (feature, layer, type) {
    const popupContent = createPopupContent(feature)
    const tooltipContent = createTooltipContent(feature)

    if (popupContent) {
        layer.bindPopup(popupContent)
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
    if (tooltipContent) {
        layer.bindTooltip(tooltipContent)
    }

    if (feature.geometry.type === 'LineString' && feature.properties.type !== 'bikelane') {
        let defaultColor = '#f25824'
        let hoverColor = '#ff8800'
        let defaultStyleColor
        layer.on('mouseover', function (e) {
            defaultStyleColor = e.target.options.style.color || defaultColor
            e.target.setStyle({
                color: hoverColor,
            })
        })
        layer.on('mouseout', function (e) {
            e.target.setStyle({ color: defaultStyleColor })
        })
    }
}
