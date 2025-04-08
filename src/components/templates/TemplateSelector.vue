<template>
    <div class="templateSelector" :class="{temporary:temporary,demo:demo,public:template?.publish}" :title="template?.desc"
        @click="onSelection">
        <div class="preview">
            <img v-if="thumbnail" :src="thumbnail" />
            <div v-else class="default">
                <font-awesome-icon icon="fa-camera" />
            </div>
        </div>
        <div class="name">{{template?.name}}</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Template } from '../../model/Template';

const emits = defineEmits(['selection'])
const props = defineProps({ 
  template: { type: Object, required: true},
  temporary: { type: Boolean, default: false},
  demo: { type: Boolean, default: false},
  src: { type: String, default: null }
})
const noTemplate = Template.noTemplate()
const template = ref<Template>(noTemplate)
const thumbnail = ref<string|undefined>(undefined)

onMounted(() => {
    // console.log('[TemplateSelector.onMounted]', props.template)
    if( props.template) {
        template.value = Template.parse(props.template)
        thumbnail.value = props.src ?? template.value.thumbUrl
        // // get thumbnail from src
        // if( props.src ) {
        //     if(props.src == 'local') {
        //         // special value for local thumbnail
        //         thumbnail.value = LocalStore.thumbnailGet(props.src)
        //     } else {
        //         thumbnail.value = props.src
        //     }
        // } else {
        //     thumbnail.value = LocalStore.thumbnailGet(props.template.id)
        // }
        // console.log('[TemplateSelector.onMounted] thumbnail', thumbnail.value)
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
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: small;
    height: 2.5rem;
}
.preview{
    background-color: white;
}
.templateSelector {
    display: flex;
    flex-flow: column;
    justify-content: center;
    border-radius: 5px;
    border: 3px solid var(--bg);
    width: 106px;
    cursor: pointer;
}
.templateSelector.demo {
    border: 3px solid #607D8B;
}
.templateSelector.public {
    border: 3px solid var(--bg-public);
}
.templateSelector.temporary {
    border: 3px dashed lightgrey;
}
img {
    width: calc(var(--page-width) / 5);
    height: calc(var(--page-height) / 5);
    object-fit: cover;
    /* border-radius: 5px; */
}
</style>