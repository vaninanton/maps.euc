import greenMarker from 'leaflet-color-markers/img/marker-icon-2x-green.png?no-inline'
import shadowMarker from 'leaflet-color-markers/img/marker-shadow.png'

export default new L.Icon({
    iconUrl: greenMarker,
    shadowUrl: shadowMarker,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})
