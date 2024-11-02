<script setup>
import { onMounted, ref, watch } from 'vue'

import ActionBar from '../shared/ActionBar.vue'

import Image from 'primevue/image'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Header from '../shared/Header.vue'

const emits = defineEmits(['replace','update'])

const props = defineProps({
    data: { type: Object, default: null },
})

function loadProps(newProps) {
    // console.log('[CoverPage.loadProps]', JSON.stringify(newProps))

    if( !newProps || !newProps.data) return;
    const data = newProps.data;
    if(data.title) title.value = data.title;
    if(data.imageUrl) imageUrl.value = data.imageUrl;
    if(data.subtitle) subtitle.value = data.subtitle;
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})

// End of props management

const data = ref(null)
const imageUrl = ref('')
let imageUrlBeforeEdit = ''
const mode = ref('')
const subtitle = ref('Click anywhere to customize')
let subtitleBeforeEdit = ''
const title = ref('Title')
let titleBeforeEdit = ''

function onApply() {
    const newData = { title: title.value, imageUrl: imageUrl.value, subtitle: subtitle.value }
    mode.value = ''
    emits('update', newData)
}

function onEdit() {
    imageUrlBeforeEdit = imageUrl.value;
    subtitleBeforeEdit = subtitle.value;
    titleBeforeEdit = title.value;
    mode.value = 'edit'
}

function onCancel() {
    mode.value = ''
    imageUrl.value = imageUrlBeforeEdit;
    subtitle.value = subtitleBeforeEdit;
    title.value = titleBeforeEdit;
}

</script>

<template>
    <div class="contentPage pageCover">
        <Header v-if="mode=='edit'" title="Cover Page" :hideReplace="false" :page="true"
            @replace="emits('replace')"></Header>
        <div v-if="mode=='edit'" class="settings">
            <InputGroup>
                <InputGroupAddon class="coverAddon">Title</InputGroupAddon>
                <InputText v-model="title" />
            </InputGroup>
            <InputGroup>
                <InputGroupAddon class="coverAddon">Image URL</InputGroupAddon>
                <InputText v-model="imageUrl" placeholder="http://somewhere.net/images/cover.jpg" />
            </InputGroup>
            <InputGroup>
                <InputGroupAddon class="coverAddon">Subtitle</InputGroupAddon>
                <InputText v-model="subtitle" />
            </InputGroup>
            <ActionBar @cancel="onCancel" @apply="onApply"/>
        </div>
        <div v-else @click="onEdit" class="main clickable">
            <div class="titleContainer">
                <div class="title">{{ title ? title : 'No Title' }}</div>
            </div>
            <Image v-if="imageUrl" :src="imageUrl" width="400" />
            <i v-else class='pi pi-camera imageHolder'></i>
            <div class="subtitle">{{ subtitle }}</div>
        </div>
    </div>
</template>

<style scoped>

.coverAddon {
    width: 6rem;
}

.imageHolder {
    font-size:7rem;
    opacity: 0.3;
}
.main{
    height: 100%;
}
.settings {
    display: flex;
    flex-flow: column;
    gap: 10px;
    padding: 5px;
}

.subtitle {
    font-size: 1rem;
    font-weight: bold;
    opacity: 0.5;
    padding-top: 2rem;
}

.title {
    font-size: 3rem;
    font-weight: bolder;
}

.titleContainer {
    height: 18rem;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>