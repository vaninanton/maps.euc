import redMarker from 'leaflet-color-markers/img/marker-icon-2x-red.png'
import blueMarker from 'leaflet-color-markers/img/marker-icon-2x-blue.png'
import greenMarker from 'leaflet-color-markers/img/marker-icon-2x-green.png'
import shadowMarker from 'leaflet-color-markers/img/marker-shadow.png'

export const greenIcon = new L.Icon({
    iconUrl: greenMarker,
    shadowUrl: shadowMarker,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

export const redIcon = new L.Icon({
    iconUrl: redMarker,
    shadowUrl: shadowMarker,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})

export const blueIcon = new L.Icon({
    iconUrl: blueMarker,
    shadowUrl: shadowMarker,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})
