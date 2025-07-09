import blueMarker from 'leaflet-color-markers/img/marker-icon-2x-blue.png'
import shadowMarker from 'leaflet-color-markers/img/marker-shadow.png'

export default new L.Icon({
    iconUrl: blueMarker,
    shadowUrl: shadowMarker,
    iconSize: [12.5, 20.5],
    iconAnchor: [6, 20.5],
    popupAnchor: [1, -17],
    shadowSize: [20.5, 20.5],
})
