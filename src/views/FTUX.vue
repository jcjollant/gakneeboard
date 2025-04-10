<template>
    <div class="container">
        <h1>Pick a demo to get started</h1>
        <div class="grid">
            <div v-for="(demo,index) in demos" class="demo" :class="['demo'+index]" @click="loadDemo(demo.page)">
                <div class="name">{{demo.title}}</div>
                <div class="subtitle">{{demo.description}}</div>
                <img :src="'/thumbnails/' + demo.img" />
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getTemplateDataFromName, SheetName } from '../assets/sheetData'
import { routeToLocalTemplate } from '../assets/data'
import { useRouter } from 'vue-router'
import { LocalStore } from '../lib/LocalStore'

class Demo {
    title: string
    img: string
    description: string
    page: string
    constructor(title: string, img: string, description: string, page:string) {
        this.title = title
        this.img = img
        this.description = description
        this.page = page
    }
}

const demos = ref<Demo[]>([
    new Demo('VFR Flight', 'skyhawk.png', 'A good starting point for VFR Flights', SheetName.skyhawk),
    new Demo('Checklists', 'checklist.png', 'Three checklists using different formats', SheetName.checklist),
    new Demo('Charts', 'charts.png', 'An Airport Diagrams and Instrument plates', SheetName.charts),
    new Demo('IFR Flight', 'strips.png', 'A strips based template', SheetName.ifrflight),
])
const router = useRouter()

function loadDemo(page: string) {
    const templateData = getTemplateDataFromName(page)
    if(!templateData)  {
        console.log('[FTUX.loadDemo] Unknown Demo Template')
        return;
    }
    // Save demo data to localstore
    routeToLocalTemplate(router, templateData);
    // We are done with FTUX
    LocalStore.popupHide(3)
}

</script>
<style scoped>
h1 {
    margin-top: 2rem;
}
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 10px;
}
img {
    width: 160px;
    /* height: 320px; */
    object-fit: cover;
    margin-top: 1rem;
}
.name {
    font-size: 1.5em;
    font-weight: bold;
}
.subtitle {
    font-size: 1em;
    margin-top: 0.5em;
}  
.demo {
    border: 3px solid var(--bg);
    border-radius: 10px;
    padding: 1em;
    cursor: pointer;
}

/* Media query for mobile devices */
@media (max-width: 768px) {
    .grid {
        grid-template-columns: 1fr; /* Change to single column */
        grid-template-rows: auto; /* Let rows adjust automatically */
    }
    
    /* Optionally adjust other styles for mobile */
    h1 {
        font-size: 1.5rem;
        margin-top: 1rem;
    }
    
    .demo {
        padding: 0.75em;
    }
    
    .name {
        font-size: 1.2em;
    }
    
    .subtitle {
        font-size: 0.9em;
    }
    
    img {
        width: 140px;
    }
}
</style>