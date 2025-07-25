import calculateRouteDistance from './CalculateRouteDistance'

export default function createTooltip(feature, layer, type) {
    if (type === 'point') {
        layer.bindTooltip(feature.properties.name || 'Точка')
    } else if (type === 'socket') {
        layer.bindTooltip('Розетка ' + feature.properties.name)
    } else if (type === 'route') {
        let tooltipContent = []
        tooltipContent.push(feature.properties.name || 'Маршрут')
        tooltipContent.push(
            '<span class="text-gray-600">(' + calculateRouteDistance(feature.geometry.coordinates) + ' км)</span>',
        )
        layer.bindTooltip(tooltipContent.join(' '))
    }
}
