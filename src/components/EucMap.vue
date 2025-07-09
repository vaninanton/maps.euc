<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

import pointsGeojson from '../assets/points.json'
import routesGeojson from '../assets/routes.json'
import socketsGeojson from '../assets/sockets.json'
import velojolAlmaty from '../assets/velojol/almaty.json'
import velojol2geojson from '../helpers/Velojol2GeoJson'
import greenIcon from '../helpers/GreenIcon'
import blueIcon from '../helpers/BlueIcon'
import generateGeoJson from '../helpers/GenerateGeoJson'
import createPopupForFeature from '../helpers/CreatePopupForFeature'
import FeatureTypeWizard from './FeatureTypeWizard.vue'

const showWizard = ref(false)
const currentLayer = ref(null)

let map
let tileLayer
let pointsLayer
let socketsLayer
let routesLayer
let veloLayer

const handleWizardSelect = () => {
    // Скрываем визард
    showWizard.value = false
    currentLayer.value = null
}

const handleWizardCancel = () => {
    // Удаляем слой если пользователь отменил
    if (currentLayer.value) {
        map.removeLayer(currentLayer.value)
    }
    showWizard.value = false
    currentLayer.value = null
}

onMounted(function () {
    map = L.map('map').setView([43.226807, 76.904848], 12)
    tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; OpenStreetMap, TG: <a href="https://t.me/+m9ifLDAQddM5ZDEy" target="_blank">Электроклуб Алматы</a>, Велодорожки: <a href="https://velojol.kz" target="_blank">velojol.kz</a>',
    })

    // Споты
    pointsLayer = L.geoJSON(pointsGeojson, {
        pmIgnore: true,
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: blueIcon,
            })
        },
        onEachFeature: createPopupForFeature,
    })

    // Розетки
    socketsLayer = L.geoJSON(socketsGeojson, {
        pmIgnore: true,
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: greenIcon,
            })
        },
        onEachFeature: createPopupForFeature,
    })

    // Маршруты
    routesLayer = L.geoJSON(routesGeojson, {
        pmIgnore: true,
        style: {
            color: 'red',
            weight: 3,
        },
        onEachFeature: createPopupForFeature,
    })

    // Велодорожки
    const veloGeoJson = velojol2geojson(velojolAlmaty, ['alm84', 'alm85', 'alm86', 'alm89'])
    veloLayer = L.geoJSON(veloGeoJson, {
        pmIgnore: true,
        style: {
            color: 'green',
            weight: 3,
            dashArray: '6, 6',
        },
        onEachFeature: createPopupForFeature,
    })

    map.pm.setLang('ru')

    map.pm.addControls({
        position: 'topleft',
        drawCircleMarker: false,
        drawPolygon: false,
        drawRectangle: false,
        drawCircle: false,
        drawText: false,
        drawMarker: true,
        rotateMode: false,
        dragMode: false,
        removalMode: false,
        cutPolygon: false,
    })

    map.on('pm:create', (e) => {
        console.log('pm:create event fired', e)
        currentLayer.value = e.layer
        showWizard.value = true
        console.log('showWizard set to:', showWizard.value)
    })

    map.on('pm:globaleditmodetoggled', (e) => {
        generateGeoJson(map)
    })

    tileLayer.addTo(map)
    pointsLayer.addTo(map)
    socketsLayer.addTo(map)
    routesLayer.addTo(map)
    // Велодорожки по умолчанию выключены
    // veloLayer.addTo(map)

    // Панель управления слоями
    const overlayMaps = {
        Точки: pointsLayer,
        Розетки: socketsLayer,
        Маршруты: routesLayer,
        Велодорожки: veloLayer,
    }

    L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map)
})

onBeforeUnmount(() => {
    if (map) map.remove()
})
</script>

<template>
    <div id="map"></div>
    <FeatureTypeWizard
        :visible="showWizard"
        :layer="currentLayer"
        @select="handleWizardSelect"
        @cancel="handleWizardCancel"
    />
</template>

<style scoped>
#map {
    height: 100vh;
    width: 100vw;
}
</style>
