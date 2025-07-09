import FeatureTypes from './FeatureTypes'

function createPopupContent(feature) {
    const { type, name, description } = feature.properties ?? {}

    return [
        type && FeatureTypes[type] ? `<span class="font-semibold">${FeatureTypes[type]?.name}</span> ` : '',
        name ? `<span class="font-bold">${name}</span>` : '',
        description ? `<div>${description}</div>` : '',
    ].join('')
}

export default function (feature, layer) {
    const popupContent = createPopupContent(feature)
    if (popupContent) {
        layer.bindPopup(popupContent)
    }
}
