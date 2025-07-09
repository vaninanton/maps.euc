export default function () {
    var fg = L.featureGroup()
    var layers = []
    map.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
            layers.push(layer)
        }
    })

    // filter out layers that don't have the leaflet-geoman instance
    layers = layers.filter((layer) => !!layer.pm)

    // filter out everything that's leaflet-geoman specific temporary stuff
    layers = layers.filter((layer) => !layer._pmTempLayer)
    layers.forEach(function (layer) {
        fg.addLayer(layer)
    })
    console.log(fg.toGeoJSON())
}
