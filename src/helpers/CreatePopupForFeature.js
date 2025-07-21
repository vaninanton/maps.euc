import FeatureTypes from './FeatureTypes'

function createTooltipContent(feature) {
    const { type, name, description } = feature.properties ?? {}
    const typeText = type && FeatureTypes[type] ? `<span class="font-semibold">${FeatureTypes[type]?.name}</span> ` : ''
    const nameText = name ? name : ''

    return typeText + nameText
}

function createPopupContent(feature) {
    const { type, name, description } = feature.properties ?? {}
    const coordinates = feature.geometry.coordinates
    const isPoint = feature.geometry.type === 'Point'
    const isMobile2GisType = window.innerWidth <= 800 ? 'scooter' : 'pedestrian'

    const content = [
        type && FeatureTypes[type] ? `<span class="font-semibold">${FeatureTypes[type]?.name}</span> ` : '',
        name ? `<span class="font-bold">${name}</span>` : '',
        description ? `<div>${description}</div>` : '',
        isPoint ? '<div class="maps-links">' : '',
        isPoint ? '<h3>Построить маршрут:</h3>' : '',
        isPoint
            ? `<a href="https://yandex.ru/maps/?rtext=~${coordinates[1]},${coordinates[0]}&rtt=sc" target="_blank">Яндекс.Карты</a> `
            : '',
        isPoint
            ? `<a href="https://2gis.kz/directions/tab/${isMobile2GisType}/points/|${coordinates[0]},${coordinates[1]}" target="_blank">2GIS</a>`
            : '',
        isPoint ? '</div>' : '',
    ]

    return content.join('')
}

export default function (feature, layer) {
    const popupContent = createPopupContent(feature)
    const tooltipContent = createTooltipContent(feature)
    if (popupContent) {
        layer.bindPopup(popupContent)
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
