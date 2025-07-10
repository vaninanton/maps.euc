import redMarker from 'leaflet-color-markers/img/marker-icon-2x-red.png'
import shadowMarker from 'leaflet-color-markers/img/marker-shadow.png'

export default new L.Icon({
    iconUrl: redMarker,
    shadowUrl: shadowMarker,
    iconSize: [25, 41],
    iconAnchor: [6, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})
