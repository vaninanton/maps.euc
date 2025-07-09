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
import FeatureShare from './FeatureShare.vue'
import markerIconUrl from 'leaflet/dist/images/marker-icon.png'
import markerIconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png'

const showWizard = ref(false)
const currentLayer = ref(null)
const showShare = ref(false)
const shareData = ref(null)

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

const handleWizardSave = (data) => {
    // Скрываем визард и показываем share
    showWizard.value = false
    shareData.value = data
    showShare.value = true
}

const handleWizardCancel = () => {
    // Удаляем слой если пользователь отменил
    if (currentLayer.value) {
        map.removeLayer(currentLayer.value)
    }
    showWizard.value = false
    currentLayer.value = null
}

const handleShareClose = () => {
    showShare.value = false
    shareData.value = null
    currentLayer.value = null
}

onMounted(function () {
    map = L.map('map').setView([43.226807, 76.904848], 12)

    L.Icon.Default.prototype.options.iconUrl = markerIconUrl
    L.Icon.Default.prototype.options.iconRetinaUrl = markerIconRetinaUrl
    L.Icon.Default.prototype.options.shadowUrl = markerShadowUrl
    L.Icon.Default.imagePath = ''

    // Проверяем, есть ли параметр share в URL
    const hash = window.location.hash
    if (hash && hash.startsWith('#share=')) {
        try {
            const base64Data = hash.substring(7) // убираем '#share='
            const jsonString = decodeURIComponent(escape(atob(base64Data)))
            const parsedData = JSON.parse(jsonString)

            // Показываем компонент FeatureShare с данными
            shareData.value = parsedData
            showShare.value = true
        } catch (error) {
            console.error('Ошибка при разборе share ссылки:', error)
        }
    }
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
        editMode: false,
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
        @save="handleWizardSave"
        @cancel="handleWizardCancel"
    />
    <FeatureShare :visible="showShare" :shareData="shareData" @close="handleShareClose" />
</template>

<style scoped>
#map {
    height: 100vh;
    width: 100vw;
}
</style>
