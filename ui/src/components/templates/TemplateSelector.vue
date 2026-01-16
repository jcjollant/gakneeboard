<template>
    <div class="templateSelector" :class="{clipped:clipped}" :title="template?.desc"
        @click="onSelection">
        <img v-if="clipped" src="/assets/clip.png" class="clip" />
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
import { onMounted, ref } from 'vue'
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
const noTemplate = Template.noTemplate()
const template = ref<Template>(noTemplate)
const thumbnails = ref<string[]>([])

onMounted(() => {
    if( props.template) {
        template.value = Template.parse(props.template)
        if (Array.isArray(props.src)) {
            thumbnails.value = props.src as string[]
        } else {
            thumbnails.value = props.src ? [props.src] : (template.value.thumbUrl ? [template.value.thumbUrl] : [])
        }
    } else {
        template.value = noTemplate
    }
})

function onSelection() {
    emits('selection', template.value)
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
    width: calc(var(--page-width) / 5);
}
.page {
    width: calc(var(--page-width) / 5);
    height: calc(var(--page-height) / 5);
    object-fit: cover;
}

.templateSelector:hover {
    border-color: var(--primary-color, #3B82F6);
}
</style>