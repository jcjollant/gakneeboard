<template>
    <div class="home">
        <Toast />
        <Menu></Menu>
        <div class="section templateSection">
            <div class="header">Templates</div>
            <div class="templateList">
                <TemplateSelector :template="newTemplate" :temporary="true" src="/thumbnails/new.png" class="templateNew"
                    @selection="onNewTemplate"/>
                <!-- <TemplateSelector :template="localTemplate" :temporary="true" src="local"
                    @selection="onTemplateSelection('local')"/> -->
                <TemplateSelector v-if="templates.length > 0" v-for="(template,index) in templates" 
                    :template="template"  
                    @selection="onTemplateSelection(template.id)" />
                <div v-else>
                    <PlaceHolder title="No Templates (yet)" subtitle="Your saved templates will show here"/>
                </div>
            </div>
        </div>
        <div class="section demoSection">
            <div class="header" @click="onDemoSelection(SheetName.default)">Demos</div>
            <div class="templateList">
                <TemplateSelector v-for="(ds,index) in demos" :template="ds.template" :demo="true" :src="'/thumbnails/'+ds.src" :class="'demo'+index"
                    @selection="onDemoSelection(ds.name)" />
                <!-- list all demos -->
            </div>
        </div>
        <!-- <div class="section demoSection">
            <div class="header">POH Normal Procedures</div>
            <div class="templateList">
                <TemplateSelector v-for="(p,index) in poh" :template="p.template" :demo="true" :src="'/thumbnails/'+p.src" :class="'poh'+index"
                    @selection="onPohSelection(d.code)" />
            </div>
        </div> -->
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { currentUser, routeToLocalTemplate } from '../assets/data';
import { useRouter } from 'vue-router';
import { getTemplateBlank, SheetName } from '../assets/sheetData';
import { Template } from '../model/Template';
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../assets/Toaster';

import Menu from '../components/menu/Menu.vue'
import PlaceHolder from '../components/shared/PlaceHolder.vue'
import TemplateSelector from '../components/templates/TemplateSelector.vue'
import Toast from 'primevue/toast'
import { DemoData } from '../assets/DemoData';

class DemoSelector {
    name: string
    src: string
    template: Template
    constructor(name:string, src:string, templateName:string, templateDesc:string) {
        this.name = name
        this.src = src
        this.template = new Template(templateName,templateDesc)
    }
}

const demos = ref<DemoSelector[]>([
    new DemoSelector(SheetName.skyhawk, 'skyhawk.png', 'VFR Flight', 'Skyhawk Reference Sheet'),
    new DemoSelector(SheetName.checklist, 'checklist.png', 'Checklist','Checklists syntax Showcase'),
    new DemoSelector(SheetName.tiles, 'tiles.png', 'Tiles','Tiles Gallery'),
    new DemoSelector(SheetName.navlog, 'navlog.png', 'NavLog', 'Navlog page and companion tiles'),
    new DemoSelector(SheetName.charts, 'charts.png', 'Charts','Airport Diagram and Instrument Approach'),
    new DemoSelector(SheetName.holds, 'holds.png', 'Holds Practice','Full sheet of Holds and Compasses'),
    new DemoSelector(SheetName.ifrflight, 'strips.png', 'IFR Flight','Strips for IFR flights notekeeping'),
])
// const poh = ref([
//     {code: 'AA', src: 'C172SGFC700.png', template: {name:'C172S GFC700',desc:'CESSNA MODEL 172S NAV III GFC 700 AFCS'}},
// ])
//const localTemplate = ref({name:'Local',desc:'Resume your last session'})
const newTemplate = ref(new Template('New','Create a new template'))
const router = useRouter()
const templates = ref<Template[]>([])
const toast = useToast()
const toaster = useToaster(toast)

onMounted( () => {
    // console.log('[Home.onMounted] templates', currentUser.templates.length)
    templates.value = currentUser.templates
    // console.log('[Home.onMounted] template length', templates.value.length)
    currentUser.addListener(userUpdate);
    // localTemplate.value = templates.value[0]
    // setTimeout(() => {
    //     checkThumbnails()
    // }, 500)
})

onUnmounted( () => {
    // console.log('[Home.onUnmounted]')
    currentUser.removeListener(userUpdate)
})

function onDemoSelection(name:string) {
    const templateData = DemoData.fromName(name)
    if(!templateData) {
        toaster.error('Load Demo', 'Unknown Demo Template')
        return;
    }
    // Save demo data to localstore
    routeToLocalTemplate(router, templateData);
}

function onNewTemplate() {
    const templateData = getTemplateBlank()
    templateData.name = 'New Template'

    // Save demo data to localstore
    routeToLocalTemplate(router, templateData);
}

function onTemplateSelection(index) {
    router.push( '/template/' + index)
}

function userUpdate() {
    // console.log('[Home.userUpdate]')
    templates.value = currentUser.templates
    // console.log('[Home.userUpdate] template length', templates.value.length)
}
</script>

<style scoped>
.header {
    border-bottom: 1px dashed lightgrey;
    font-weight: bolder;
    text-align: left;
    padding-top: 10px;
    padding-left: 20px;
    padding-bottom: 5px;
}
.home {
    display: flex;
    flex-flow: column;
    gap: 10px;
}
.section {
    border: 3px solid lightgrey;
    border-radius: 10px;
    flex-grow: 1;
    margin: 0 10px;
}
.templateList {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 10px;
}
</style>