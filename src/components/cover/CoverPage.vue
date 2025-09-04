<template>
    <div class="contentPage pageCover">
        <Header v-if="mode=='edit'" title="Cover Page" :showReplace="true" :page="true" :displayMode="false"
            @replace="emits('replace')"></Header>
        <div v-if="mode=='edit'" class="settings">
            <InputGroup>
                <InputGroupAddon class="coverAddon">Title</InputGroupAddon>
                <InputText v-model="title" />
            </InputGroup>
            <InputGroup>
                <InputGroupAddon class="coverAddon">Image URL</InputGroupAddon>
                <InputText v-model="imageUrl" placeholder="http://somewhere.net/images/cover.jpg" />
            <Button icon="pi pi-refresh" label="Fetch" @click="onFetch" />
            </InputGroup>
            <InputGroup>
                <InputGroupAddon class="coverAddon">Subtitle</InputGroupAddon>
                <InputText v-model="subtitle" />
            </InputGroup>
            <ImageViewer :url="imageBlobUrl" class="imageViewer" />
            <ActionBar @cancel="onCancel" @apply="onApply"/>
        </div>
        <div v-else @click="onEdit" class="main clickable">
            <div v-if="title" class="titleContainer">
                <div class="title">{{ title ? title : 'No Title' }}</div>
            </div>
            <ImageViewer :url="imageBlobUrl" class="imageViewer" />
            <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

import ActionBar from '../shared/ActionBar.vue'
import Button from 'primevue/button'
import ImageViewer from './ImageViewer.vue'
import InputGroup from 'primevue/inputgroup'
import InputGroupAddon from 'primevue/inputgroupaddon'
import InputText from 'primevue/inputtext'
import Header from '../shared/Header.vue'
import axios from 'axios'
import { GApiUrl } from '../../lib/GApiUrl'
import { currentUser } from '../../assets/data'
// import axios from 'axios'

const emits = defineEmits(['replace','update'])

const props = defineProps({
    data: { type: Object, default: null },
})
const data = ref(null)
const imageUrl = ref('')
const imageBlobUrl = ref('')
let imageUrlBeforeEdit = ''
const mode = ref('')
const subtitle = ref('Click anywhere to customize')
let subtitleBeforeEdit = ''
const title = ref('Title')
let titleBeforeEdit = ''



function loadProps(newProps:any) {
    // console.debug('[CoverPage.loadProps]', newProps.data)

    if( !newProps || !newProps.data) return;
    const data = newProps.data;
    if(data.title) title.value = data.title;
    if(data.imageUrl) imageUrl.value = data.imageUrl;
    if(data.blobUrl) imageBlobUrl.value = data.blobUrl;
    if(data.subtitle) subtitle.value = data.subtitle;
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})

// End of props management

function onApply() {
    const newData = { 
        title: title.value, 
        imageUrl: imageUrl.value, 
        blobUrl: imageBlobUrl.value, 
        subtitle: subtitle.value 
    }
    mode.value = ''
    emits('update', newData)
}

function onCancel() {
    mode.value = ''
    imageUrl.value = imageUrlBeforeEdit;
    subtitle.value = subtitleBeforeEdit;
    title.value = titleBeforeEdit;
}

function onEdit() {
    imageUrlBeforeEdit = imageUrl.value;
    subtitleBeforeEdit = subtitle.value;
    titleBeforeEdit = title.value;
    mode.value = 'edit'
}

async function onFetch() {
    const url = GApiUrl.root + 'userImage/'
    const payload = {user:currentUser.sha256, imageUrl:imageUrl.value}
    const headers = { headers: {'Content-Type':'application/json'} }
    // console.debug('[CoverPage.onFetch]', url, payload)
    await axios.post(url, payload, headers).then( response => {
        // console.debug('[CoverPage.onFetch]', response.data)
        imageBlobUrl.value = response.data;
    }).catch( error => {
        console.log(error)
    })

}
</script>

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
    max-height: var(--page-height);
    display: flex;
    flex-flow: column;
    justify-content: space-evenly;

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
    height: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
}
.imageViewer {
    height: 100%;
    width: 100%;
}
</style>