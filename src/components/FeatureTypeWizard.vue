<script setup>
import { ref, watch } from 'vue'
import FeatureTypes from '../helpers/FeatureTypes'
import * as L from 'leaflet'

const emit = defineEmits(['select', 'cancel', 'save'])

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    layer: {
        type: Object,
        default: null
    }
})

const selectedType = ref(FeatureTypes.ROUTE)

// Определяем тип объекта по слою
const detectLayerType = () => {
    if (!props.layer) return FeatureTypes.ROUTE

    // Если это маркер - значит точка
    if (props.layer instanceof L.Marker || props.layer._latlng) {
        return FeatureTypes.POINT
    }

    // Если это линия - значит маршрут
    if (props.layer instanceof L.Polyline || props.layer._latlngs) {
        return FeatureTypes.ROUTE
    }

    return FeatureTypes.ROUTE
}

// Следим за изменением слоя
watch(() => props.layer, (newLayer) => {
    if (newLayer) {
        selectedType.value = detectLayerType()
    }
})
const title = ref('')
const description = ref('')

const handleSelect = async () => {
    console.log('handleSelect called')
    console.log('selectedType:', selectedType.value)
    console.log('props.layer:', props.layer)

    if (!selectedType.value) {
        alert('Пожалуйста, выберите тип объекта')
        return
    }

    if (!props.layer) {
        console.error('Layer is missing!')
        return
    }

    props.layer.feature = props.layer.feature || {}
    props.layer.feature.type = 'Feature'
    props.layer.feature.properties = {
        type: selectedType.value,
        title: title.value || '',
        description: description.value || ''
    }

    const geoJsonData = props.layer.toGeoJSON()
    geoJsonData.properties = {
        type: selectedType.value,
        title: title.value || '',
        description: description.value || ''
    }

    console.log('Сформированный GeoJSON:', geoJsonData)

    // Определяем тип объекта для сообщения
    const typeText = selectedType.value === FeatureTypes.POINT ? 'точку' :
                    selectedType.value === FeatureTypes.SOCKET ? 'розетку' :
                    'маршрут'

    // Создаем данные для share
    const shareData = {
        type: selectedType.value,
        typeText: typeText,
        title: title.value || '',
        description: description.value || '',
        geoJson: geoJsonData
    }

    // Передаем данные родительскому компоненту
    emit('save', shareData)
    resetForm()
}


const handleCancel = () => {
    emit('cancel')
    resetForm()
}

const resetForm = () => {
    selectedType.value = FeatureTypes.ROUTE
    title.value = ''
    description.value = ''
}
</script>

<template>
    <div v-if="visible" class="wizard-overlay">
        <div class="wizard-modal">
            <h2>Выберите тип объекта</h2>

            <div class="type-selection">
                <label :class="{ disabled: detectLayerType() !== FeatureTypes.POINT }">
                    <input type="radio" v-model="selectedType" :value="FeatureTypes.POINT" :disabled="detectLayerType() !== FeatureTypes.POINT" />
                    Точка (место для катания)
                </label>
                <label :class="{ disabled: detectLayerType() !== FeatureTypes.POINT }">
                    <input type="radio" v-model="selectedType" :value="FeatureTypes.SOCKET" :disabled="detectLayerType() !== FeatureTypes.POINT" />
                    Розетка (место для зарядки)
                </label>
                <label :class="{ disabled: detectLayerType() !== FeatureTypes.ROUTE }">
                    <input type="radio" v-model="selectedType" :value="FeatureTypes.ROUTE" :disabled="detectLayerType() !== FeatureTypes.ROUTE" />
                    Маршрут
                </label>
            </div>

            <div class="form-fields">
                <div class="field">
                    <label for="title">Название:</label>
                    <input
                        id="title"
                        v-model="title"
                        type="text"
                        placeholder="Введите название объекта"
                    />
                </div>

                <div class="field">
                    <label for="description">Описание:</label>
                    <textarea
                        id="description"
                        v-model="description"
                        placeholder="Введите описание объекта"
                        rows="3"
                    ></textarea>
                </div>
            </div>

            <div class="wizard-buttons">
                <button @click="handleSelect" class="btn-primary">Сохранить</button>
                <button @click="handleCancel" class="btn-secondary">Отмена</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.wizard-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.wizard-modal {
    background: white;
    padding: 20px;
    border-radius: 8px;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.wizard-modal h2 {
    margin-top: 0;
    margin-bottom: 20px;
}

.type-selection {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.type-selection label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.type-selection label.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.form-fields {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.field label {
    font-weight: bold;
}

.field input,
.field textarea {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.wizard-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.wizard-buttons button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

.btn-primary {
    background: #4CAF50;
    color: white;
}

.btn-primary:hover {
    background: #45a049;
}

.btn-secondary {
    background: #f44336;
    color: white;
}

.btn-secondary:hover {
    background: #da190b;
}

</style>
