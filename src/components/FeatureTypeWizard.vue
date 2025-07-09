<script setup>
import { ref } from 'vue'
import FeatureTypes from '../helpers/FeatureTypes'

const emit = defineEmits(['select', 'cancel'])

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
const title = ref('')
const description = ref('')
const showTelegramLink = ref(false)
const telegramUrl = ref('')
const countdown = ref(10)

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

    // Добавляем свойства к слою
    props.layer.feature = props.layer.feature || {}
    props.layer.feature.type = 'Feature'
    props.layer.feature.properties = {
        type: selectedType.value,
        title: title.value || '',
        description: description.value || ''
    }

    // Генерируем GeoJSON
    const geoJsonData = props.layer.toGeoJSON()
    geoJsonData.properties = props.layer.feature.properties

    console.log('Сформированный GeoJSON:', geoJsonData)

    // Отправляем в Telegram
    await sendToTelegram(geoJsonData)
}

const sendToTelegram = async (geoJsonData) => {
    try {
        const message = JSON.stringify(geoJsonData, null, 2)

        const encodedMessage = encodeURIComponent(message)

        telegramUrl.value = `https://t.me/vanton?text=${encodedMessage}`

        window.open(telegramUrl.value, '_blank')

        showTelegramLink.value = true
        countdown.value = 10

        const timer = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0) {
                clearInterval(timer)
                emit('select')
                resetForm()
            }
        }, 1000)
    } catch (error) {
        console.error('Ошибка при создании ссылки Telegram:', error)
        alert('Ошибка при создании ссылки. Проверьте консоль.')
    }
}

const handleCancel = () => {
    emit('cancel')
    resetForm()
}

const resetForm = () => {
    selectedType.value = FeatureTypes.ROUTE
    title.value = ''
    description.value = ''
    showTelegramLink.value = false
    telegramUrl.value = ''
    countdown.value = 10
}
</script>

<template>
    <div v-if="visible" class="wizard-overlay">
        <div class="wizard-modal">
            <h2>Выберите тип объекта</h2>

            <div class="type-selection">
                <label class="disabled">
                    <input type="radio" v-model="selectedType" :value="FeatureTypes.POINT" disabled />
                    Точка (место для катания)
                </label>
                <label class="disabled">
                    <input type="radio" v-model="selectedType" :value="FeatureTypes.SOCKET" disabled />
                    Розетка (место для зарядки)
                </label>
                <label>
                    <input type="radio" v-model="selectedType" :value="FeatureTypes.ROUTE" />
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

            <div v-if="showTelegramLink" class="telegram-link-info">
                <p>Если Telegram не открылся автоматически, откройте ссылку вручную:</p>
                <a :href="telegramUrl" target="_blank" class="telegram-link">Открыть в Telegram</a>
                <p class="countdown">Визард закроется через: <strong>{{ countdown }}</strong> сек.</p>
            </div>

            <div class="wizard-buttons">
                <button @click="handleSelect" class="btn-primary" :disabled="showTelegramLink">Отправить</button>
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

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.telegram-link-info {
    background: #f0f0f0;
    padding: 15px;
    border-radius: 4px;
    margin-bottom: 20px;
    text-align: center;
}

.telegram-link-info p {
    margin: 5px 0;
}

.telegram-link {
    color: #0088cc;
    text-decoration: none;
    font-weight: bold;
    display: inline-block;
    margin: 10px 0;
}

.telegram-link:hover {
    text-decoration: underline;
}

.hint {
    font-size: 12px;
    color: #666;
    font-style: italic;
}

.countdown {
    font-size: 14px;
    color: #333;
    margin-top: 10px;
}

.countdown strong {
    color: #0088cc;
    font-size: 18px;
}
</style>
