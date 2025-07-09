import FeatureTypes from './FeatureTypes'

function createPopupContent(feature) {
    const { type, name, description } = feature.properties ?? {}

    // console.log(feature.geometry.type);
    // console.log(feature.geometry.coordinates);
    return [
        type && FeatureTypes[type] ? `<span class="font-semibold">${FeatureTypes[type]?.name}</span> ` : '',
        name ? `<span class="font-bold">${name}</span>` : '',
        description ? `<div>${description}</div>` : '',
        (feature.geometry.type === 'Point') ? '<div class="maps-links">' : '',
        (feature.geometry.type === 'Point') ? '<a href="https://yandex.ru/maps/?rtext=~'+feature.geometry.coordinates[1]+','+feature.geometry.coordinates[0]+'&rtt=sc" target="_blank">Яндекс.Карты</a> ' : '',
        (feature.geometry.type === 'Point') ? '<a href="https://2gis.kz/directions/tab/bicycle/points/|'+feature.geometry.coordinates[0]+','+feature.geometry.coordinates[1]+'" target="_blank">2GIS</a>' : '',
        (feature.geometry.type === 'Point') ? '</div>' : '',
    ].join('')
}

export default function (feature, layer) {
    const popupContent = createPopupContent(feature)
    if (popupContent) {
        layer.bindPopup(popupContent)
    }
}
