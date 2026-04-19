<template>
    <div class="worksheetSelector" :title="template?.desc" @click="onSelection">
        <div class="preview" :class="{ public: parsedTemplate.publish }">
            <div v-if="thumbnails.length > 0" class="pages">
                <img v-for="thumb in thumbnails" :key="thumb" :src="thumb" class="page" />
            </div>
            <div v-else class="default">
                <font-awesome-icon icon="fa-file-alt" />
            </div>
        </div>
        <div class="name">{{ template?.name }}</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Template } from '../../models/Template'

const emits = defineEmits(['selection'])
const props = defineProps({
    template: { type: Object, required: true },
})

const parsedTemplate = computed(() => Template.parse(props.template))

const thumbnails = computed(() => {
    const t = parsedTemplate.value
    const rawThumbs = t.thumbUrl ? [t.thumbUrl] : []
    return rawThumbs.map(thumb => {
        if (thumb.startsWith('/thumbnails/') || thumb.startsWith('data:')) return thumb
        const hash = t.thumbHash
        if (!hash) return thumb
        const separator = thumb.includes('?') ? '&' : '?'
        return `${thumb}${separator}h=${hash}`
    })
})

function onSelection() {
    emits('selection', parsedTemplate.value)
}
</script>

<style scoped>
/*
 * Landscape (FullPage) thumbnail dimensions.
 * US Letter landscape: 11" wide × 8.5" tall.
 * --page-height corresponds to the portrait 8.5" axis ≡ landscape height.
 * --page-width  corresponds to the portrait 5.5" axis  (half-letter kneeboard width).
 * Landscape thumbnail height = --page-height / 5  (same scale as kneeboard thumbnails)
 * Landscape thumbnail width  = height × (11 / 8.5) ≈ height × 1.294
 */
.worksheetSelector {
    display: flex;
    flex-flow: column;
    justify-content: center;
    cursor: pointer;
    position: relative;
    /* width = landscape-height × (11/8.5) + border */
    width: calc(var(--page-height) / 5 * 11 / 8.5 + 6px);
}

.preview {
    background-color: white;
    border-radius: 5px;
    border: 3px solid var(--bg);
    transition: border-color 0.2s;
    overflow: hidden;
    /* landscape width */
    width: calc(var(--page-height) / 5 * 11 / 8.5);
}

.preview.public {
    border: 3px solid var(--bg-public);
}

.pages {
    display: flex;
    gap: 0;
}

.page {
    /* landscape dimensions at thumbnail scale */
    width: calc(var(--page-height) / 5 * 11 / 8.5);
    height: calc(var(--page-height) / 5);
    object-fit: cover;
    object-position: top left;
}

.default {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5rem;
    color: lightgrey;
    width: calc(var(--page-height) / 5 * 11 / 8.5);
    height: calc(var(--page-height) / 5);
}

.name {
    text-align: center;
    font-size: small;
    padding: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
}

.worksheetSelector:hover .preview {
    border-color: var(--primary-color, #3B82F6);
}
</style>
