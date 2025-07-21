import * as L from 'leaflet'
import velojol2geojson from './Velojol2GeoJson'
import greenIcon from './GreenIcon'
import blueIcon from './BlueIcon'
import createPopupForFeature from './CreatePopupForFeature'

import pointsGeojson from '../assets/points.json'
import routesGeojson from '../assets/routes.json'
import socketsGeojson from '../assets/sockets.json'
import velojolAlmaty from '../assets/velojol/almaty.json'

export const createPointsLayer = () =>
    L.geoJSON(pointsGeojson, {
        pmIgnore: true,
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: blueIcon,
            })
        },
        onEachFeature: createPopupForFeature,
    })

export const createSocketsLayer = () =>
    L.geoJSON(socketsGeojson, {
        pmIgnore: true,
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: greenIcon,
            })
        },
        onEachFeature: createPopupForFeature,
    })

export const createRoutesLayer = () =>
    L.geoJSON(routesGeojson, {
        pmIgnore: true,
        style: {
            color: '#f25824',
            weight: 2.5,
        },
        onEachFeature: createPopupForFeature,
    })

export const createVeloLayer = () => {
    const veloGeoJson = velojol2geojson(velojolAlmaty, ['alm84', 'alm85', 'alm86', 'alm89'])
    return L.geoJSON(veloGeoJson, {
        pmIgnore: true,
        style: {
            color: 'green',
            weight: 3,
            dashArray: '6, 6',
        },
        onEachFeature: createPopupForFeature,
    })
}
