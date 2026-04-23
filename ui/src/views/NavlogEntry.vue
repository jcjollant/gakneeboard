<template>
    <div class="navlog-entry">
        <div class="loading-overlay">
            <font-awesome-icon icon="fa-solid fa-spinner" spin class="spinner-icon" />
            <div class="loading-text">Creating Paper NavLog…</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TemplateFormat } from '@gak/shared'
import { routeToLocalTemplate } from '../assets/data.js'
import { getTemplateBlank } from '../assets/sheetData.js'
import { PageType } from '../assets/PageType'
import { TemplatePage } from '../models/Template'

const router = useRouter()

onMounted(() => {
    try {
        const templateData = getTemplateBlank()
        templateData.name = 'Paper NavLog'
        templateData.desc = 'Printable Paper Navlog Template'
        templateData.format = TemplateFormat.FullPage
        templateData.data = [new TemplatePage(PageType.paperNavlog, 'Paper NavLog')]
        routeToLocalTemplate(router, templateData)
    } catch {
        router.push('/')
    }
})
</script>

<style scoped>
.navlog-entry {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    background: var(--surface-ground, #f8f9fa);
}

.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    color: var(--bg, #0369a1);
}

.spinner-icon {
    font-size: 3rem;
}

.loading-text {
    font-size: 1.1rem;
    color: #6c757d;
}
</style>
