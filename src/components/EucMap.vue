<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import 'leaflet-providers/leaflet-providers'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'

import { createPointsLayer, createSocketsLayer, createRoutesLayer, createVeloLayer } from '../helpers/useMapLayers'

import redIcon from '../helpers/RedIcon'
import { decode } from 'js-base64'
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
let tileLayer1
let tileLayer2

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
    const onHash = () => {
        const hash = window.location.hash
        if (hash) {
            try {
                const parsedHash = new URLSearchParams(hash.substring(1))
                const base64Data = decodeURIComponent(parsedHash.get('share'))
                const jsonString = decode(base64Data)
                const parsedData = JSON.parse(jsonString)

                // Показываем компонент FeatureShare с данными
                shareData.value = parsedData
                showShare.value = true

                // Редактируемое
                L.geoJSON(
                    {
                        type: 'FeatureCollection',
                        features: [{ ...parsedData.geoJson }],
                    },
                    {
                        pmIgnore: true,
                        style: {
                            color: 'red',
                            weight: 3,
                            dashArray: '6, 6',
                        },
                        onEachFeature: createPopupForFeature,
                        pointToLayer: function (feature, latlng) {
                            return L.marker(latlng, {
                                icon: redIcon,
                            })
                        },
                    },
                ).addTo(map)
            } catch (error) {
                console.error('Ошибка при разборе share ссылки:', error)
            }
        }
    }

    window.onhashchange = () => {
        console.log('Hash changed! Parsing...')
        onHash()
    }

    onHash()

    tileLayer1 = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; OpenStreetMap, TG: <a href="https://t.me/+m9ifLDAQddM5ZDEy" target="_blank">Электроклуб Алматы</a>, Велодорожки: <a href="https://velojol.kz" target="_blank">velojol.kz</a>',
    })

    tileLayer2 = L.tileLayer.provider('MapBox', {
        id: 'vanton/cmcw742a0002m01s945vc1s0n',
        accessToken: 'pk.eyJ1IjoidmFudG9uIiwiYSI6ImNtY3c2bWo4djA2amcybXBlams0ODI0cHQifQ.-PFTlBSPris_3p7XD29szA',
    })

    let pointsLayer = createPointsLayer()
    let socketsLayer = createSocketsLayer()
    let routesLayer = createRoutesLayer()
    let veloLayer = createVeloLayer()

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

    tileLayer1.addTo(map)
    // tileLayer2.addTo(map)
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

    L.control
        .layers(
            {
                OpenStreetMap: tileLayer1,
                MapBox: tileLayer2,
            },
            overlayMaps,
            { collapsed: false },
        )
        .addTo(map)
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
