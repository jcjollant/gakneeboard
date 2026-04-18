<template>
    <div class="templateSelector" :class="{clipped:clipped && !isWide, wide:isWide}" :title="template?.desc"
        @click="onSelection">
        <img v-if="clipped && !isWide" src="/assets/clip.png" class="clip" />
        <div class="preview" :class="{temporary:temporary,demo:demo,public:template?.publish}">
            <div v-if="thumbnails.length > 0" class="pages">
                <img v-for="thumb in thumbnails" :key="thumb" :src="thumb" class="page" />
            </div>
            <div v-else class="default">
                <font-awesome-icon :icon="icon" />
            </div>
        </div>
        <div class="name">{{template?.name}}</div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TemplateFormat } from '@gak/shared';
import { Template } from '../../models/Template';

const emits = defineEmits(['selection'])
const props = defineProps({ 
  template: { type: Object, required: true},
  temporary: { type: Boolean, default: false},
  demo: { type: Boolean, default: false},
  src: { type: [String, Array], default: null },
  icon: { type: String, default: 'fa-camera'},
  clipped: { type: Boolean, default: false}
})

const parsedTemplate = computed(() => Template.parse(props.template))
const isWide = computed(() => parsedTemplate.value.format === TemplateFormat.FullPage)

const thumbnails = computed(() => {
    let rawThumbs: string[] = []
    if (Array.isArray(props.src)) {
        rawThumbs = props.src as string[]
    } else {
        const t = parsedTemplate.value
        rawThumbs = props.src ? [props.src] : (t.thumbUrl ? [t.thumbUrl] : [])
    }
    
    // Add cache buster for non-local thumbnails using the thumbHash
    return rawThumbs.map(t => {
        if (t.startsWith('/thumbnails/') || t.startsWith('data:')) return t;
        const hash = parsedTemplate.value.thumbHash;
        if (!hash) return t;
        const separator = t.includes('?') ? '&' : '?';
        return `${t}${separator}h=${hash}`;
    })
})

function onSelection() {
    emits('selection', parsedTemplate.value)
}

</script>

<style scoped>
.default {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2.5rem;
    color: lightgrey;
    width: calc(var(--page-width) / 5);
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
.preview{
    background-color: white;
    border-radius: 5px;
    border: 3px solid var(--bg);
    transition: border-color 0.2s;
}
.preview.demo {
    border-color: #607D8B;
}
.templateSelector {
    display: flex;
    flex-flow: column;
    justify-content: center;
    cursor: pointer;
    /* background-color: white; */
    position: relative;
}
.templateSelector.clipped {
    margin-top: 15px;
}
.clip {
    position: absolute;
    top: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 50%;
    z-index: 10;
}
.preview.public {
    border: 3px solid var(--bg-public);
}
.preview.temporary {
    border: 3px dashed lightgrey;
}
.pages {
    display: flex;
    gap: 8px;
}

.templateSelector:has(.pages img:nth-child(1):nth-last-child(1)) {
    width: calc(var(--page-width) / 5 + 6px);
}

.templateSelector:has(.pages img:nth-child(2)) {
    width: calc(var(--page-width) / 5 * 2 + 14px);
}

.templateSelector:has(.pages img:nth-child(3)) {
    width: calc(var(--page-width) / 5 * 3 + 4px);
}

.templateSelector:has(.default) {
    width: calc(var(--page-width) / 5 + 6px);
}
.page {
    width: calc(var(--page-width) / 5);
    height: calc(var(--page-height) / 5);
    object-fit: cover;
}

/* Wide format styles */
.templateSelector.wide {
    width: calc(var(--page-width) / 2.5 + 6px);
}
.templateSelector.wide .preview {
    width: calc(var(--page-width) / 2.5);
}
.templateSelector.wide .page {
    width: calc(var(--page-width) / 2.5);
}
.templateSelector.wide .default {
    width: calc(var(--page-width) / 2.5);
}

.templateSelector:hover {
    border-color: var(--primary-color, #3B82F6);
}
</style>