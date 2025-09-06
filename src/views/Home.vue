<template>
    <div class="home">
        <Toast />
        <Menu></Menu>
        <div class="section templateSection">
            <div class="header">My Templates</div>
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
        <div class="section demoSection">
            <div class="header">Checklists Digest <font-awesome-icon :icon="['fas', 'question']" class="inlineButton" @click="onChecklistHelp" title="How do use these checklists?"></font-awesome-icon></div>
            <div class="templateList">
                <TemplateSelector v-for="(p,index) in poh" :template="p.template" :demo="true" :src="'/thumbnails/'+p.src" :class="'poh'+index"
                    @selection="onPohSelection(p)" />
            </div>
        </div>
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
import { DemoData } from '../assets/DemoData';
import { TemplateData } from '../assets/TemplateData';
import { UserUrl } from '../lib/UserUrl'

import Menu from '../components/menu/Menu.vue'
import PlaceHolder from '../components/shared/PlaceHolder.vue'
import TemplateSelector from '../components/templates/TemplateSelector.vue'
import Toast from 'primevue/toast'
import { TemplateFormat } from '../model/TemplateFormat';

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
    new DemoSelector(SheetName.skyhawk, 'vfrflight.png', 'VFR Flight', 'VFR Flight Demo Template'),
    new DemoSelector(SheetName.ifrflight, 'ifrflight.png', 'IFR Flight','IFR Flight Demo Template'),
    new DemoSelector(SheetName.checklist, 'checklist.png', 'Checklist','Checklists syntax Showcase'),
    new DemoSelector(SheetName.acronyms, 'acronyms.png', 'Acronyms', 'Popular VFR and IFR acronyms'),
    new DemoSelector(SheetName.tiles, 'tiles.png', 'Tiles','Tiles Gallery'),
    new DemoSelector(SheetName.navlog, 'navlog.png', 'NavLog', 'Navlog page and companion tiles'),
    new DemoSelector(SheetName.charts, 'charts.png', 'Charts','Airport Diagram and Instrument Approach'),
    new DemoSelector(SheetName.holds, 'holds.png', 'Holds Practice','Full sheet of Holds and Compasses'),
    new DemoSelector(SheetName.ifrstrips, 'strips.png', 'IFR Strips','Strips for IFR flights notekeeping'),
    new DemoSelector(SheetName.seattle, 'seattle.png', 'Seattle Airports', '24 GA Airports in the Seattle Area'),
    new DemoSelector(SheetName.paperNavlog, 'paper-navlog.png', 'Paper NavLog', 'Printable Template for Paper Navlog'),
])
interface Poh {
    code: string
    src: string
    template: Template
}
const poh = ref<Poh[]>([
    {code: 'AA', src: 'C172SGFC700.png', template: new Template('C172S GFC700', 'CESSNA MODEL 172S NAV III GFC 700 AFCS', false, [])},
    {code: 'AB', src: 'C182TGFC700.png', template: new Template('C182T GFC700', 'CESSNA MODEL 182T NAV III GFC 700 AFCS', false, [])},
    {code: 'AC', src: 'PA-28-161-CHEROKEE-WARRIOR-II.png', template: new Template('PA-28 CHEROKEE WII', 'PA-28 161 CHEROKEE WARRIOR II', false, [])},
])
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

function onChecklistHelp() {
    UserUrl.open( UserUrl.checklistDigestPage)
}

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
    // Instead of creating a template directly, navigate to format selection
    // router.push('/format-selector');

    const templateData = getTemplateBlank();
    templateData.name = 'New Template';
    templateData.format = TemplateFormat.Kneeboard;
  
    // Save template data to localstore and navigate to template editor
    routeToLocalTemplate(router, templateData);
}

function onPohSelection(poh:Poh) {
    const code = poh.code
    toaster.info('Loading Checklist',poh.template.name)
    TemplateData.getPublication(code).then( (templateData: any) => {
        // console.log('[Home.onPohSelection] publication found ', template)
        toast.removeAllGroups()
        if(templateData) {
            routeToLocalTemplate(router, templateData)
        } else {
            // template not found?
            toaster.error('Load POH','Error fectching template ' + code)
        }
    }).catch((e: any) => {
        // Get publication failed
        toaster.error('Load POH','Error fetching template ' + code)
        console.log('[Home.onPohSelection] publication fetch failed', e)
    }) 
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

.inlineButton {
    color: var(--bg);
    cursor: pointer ;
    margin-left: 15px;
}
</style>
