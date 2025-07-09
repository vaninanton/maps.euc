import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('@geoman-io')) {
                        return '@geoman-io'
                    }
                    if (id.includes('leaflet')) {
                        return 'leaflet'
                    }
                    return
                },
            },
        },
    },
})
