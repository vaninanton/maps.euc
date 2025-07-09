// Преобразование json с сайта velojol.kz в формат geojson
export default function (items, skipIds) {
    const features = []

    items.forEach((item) => {
        if (skipIds.includes(item.id)) {
            return
        }

        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: item.coordinates,
            },
            properties: {
                name: item.name,
                description: item.description,
                type: 'bikelane',
            },
        })
    })

    return {
        type: 'FeatureCollection',
        features: features,
    }
}
