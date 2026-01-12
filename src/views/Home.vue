<template>
    <div class="home">
        <Toast />

        <Menu></Menu>
        <div class="section templateSection kneeboardSection">
            <div class="header">My Kneeboards</div>
            <div class="templateList">
                <TemplateSelector :template="newTemplate" :temporary="true" :clipped="true" src="/thumbnails/new.png" class="templateNew"
                    @selection="onNewTemplate"/>
                <!-- <TemplateSelector :template="localTemplate" :temporary="true" src="local"
                    @selection="onTemplateSelection('local')"/> -->
                <TemplateSelector v-if="kneeboards.length > 0" v-for="(template,index) in kneeboards" 
                    :template="template" :clipped="true"
                    @selection="onTemplateSelection(template.id)" />
                <div v-else>
                    <PlaceHolder title="No Templates (yet)" subtitle="Your saved templates will show here"/>
                </div>
            </div>
        </div>
        <div class="section templateSection" v-if="false">
            <div class="header" title="These can be used across several kneeboards">My Checklist Library <span class="badge">NEW</span></div>
            <div class="templateList">
                <ChecklistSelector :isNew="true" @click="onNewChecklist"/>
                <ChecklistSelector v-for="checklist in checklists" :key="checklist.id" :checklist="checklist" @click="onChecklistSelection(checklist)" @delete="onChecklistDelete(checklist)"/>
            </div>
        </div>
        <div class="section demoSection">
            <div class="header" title="Template your can just print and use right away">Ready to Print</div>
            <div class="templateList">
                <TemplateSelector v-for="(ds,index) in clickAndPrint" :template="ds.template" :demo="true" :src="ds.src" :class="'cnp'+index"
                    @selection="onDemoSelection(ds.name)" />
            </div>
        </div>
        <div class="section demoSection">
            <div class="header" @click="onDemoSelection(SheetName.default)" title="Templates you could use as a source for your own">Kneeboard Inspiration</div>
            <div class="templateList">
                <TemplateSelector v-for="(ds,index) in demos" :template="ds.template" :demo="true" :src="ds.src" :class="'demo'+index"
                    @selection="onDemoSelection(ds.name)" />
                <!-- list all demos -->
            </div>
        </div>
        <div class="section demoSection">
            <div class="header">Checklists from POH <font-awesome-icon :icon="['fas', 'question']" class="inlineButton" @click="onChecklistHelp" title="How do use these checklists?"></font-awesome-icon></div>
            <div class="templateList">
                <TemplateSelector v-for="(p,index) in poh" :template="p.template" :demo="true" :src="'/thumbnails/'+p.src" :class="'poh'+index"
                    @selection="onPohSelection(p)" />
            </div>
        </div>
        <PricingPlans v-if="showPlans" :visible="showPlans" :user="currentUser" @close="showPlans=false" />
        <LibraryChecklistDialog :visible="showChecklistDialog" :checklist="currentLibraryChecklist" 
            @close="showChecklistDialog=false" 
            @apply="onChecklistApply"
            @delete="onChecklistDelete" />
    </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { currentUser, routeToLocalTemplate } from '../assets/data';
import { getTemplateBlank, SheetName, ThumbnailImage } from '../assets/sheetData';
import { TemplateData } from '../assets/TemplateData';
import { ChecklistService } from '../services/ChecklistService';
import { useToaster } from '../assets/Toaster';
import { UserUrl } from '../lib/UserUrl';
import Toast from 'primevue/toast';
import Menu from '../components/menu/Menu.vue';
import PlaceHolder from '../components/shared/PlaceHolder.vue';
import TemplateSelector from '../components/templates/TemplateSelector.vue';
import ChecklistSelector from '../components/checklist/ChecklistSelector.vue';
import LibraryChecklistDialog from '../components/checklist/LibraryChecklistDialog.vue';
import PricingPlans from './PricingPlans.vue';
import { TemplateFormat } from '../models/TemplateFormat';
import { LibraryChecklist } from '../models/LibraryChecklist';
import { Template, TemplatePage } from '../models/Template';
import { PageType } from '../assets/PageType';


class DemoSelector {
    name: string
    src: string[]
    template: Template
    constructor(name:string, src:string[], templateName:string, templateDesc:string) {
        this.name = name
        this.src = src.map( s => '/thumbnails/' + s)
        this.template = new Template(templateName,templateDesc)
    }
}

const demos = ref<DemoSelector[]>([
    new DemoSelector(SheetName.vfrFlight, ['vfrflight.png','vfrflight-1.png'], 'VFR Flight', 'VFR Flight Demo Template'),
    new DemoSelector(SheetName.ifrFlight, ['ifrflight.png','ifrflight-1.png'], 'IFR Flight','IFR Flight Demo Template'),
    new DemoSelector(SheetName.checklist, ['checklist-1.png','checklist-2.png'], 'Checklist','Checklists syntax Showcase'),
    new DemoSelector(SheetName.navlog, ['navlog.png','navlog-1.png'], 'NavLog', 'Navlog page and companion tiles'),
    new DemoSelector(SheetName.charts, ['charts.png','charts-1.png'], 'Charts','Airport Diagram and Instrument Approach'),
    // new DemoSelector(SheetName.seattle, ['seattle.png'], 'Seattle Airports', '24 GA Airports in the Seattle Area'),
])
const clickAndPrint = ref<DemoSelector[]>([
    new DemoSelector(SheetName.reference, [ThumbnailImage.reference0, ThumbnailImage.reference1], 'Reference Card', 'Handy Reference Visuals'),
    new DemoSelector(SheetName.acronyms, [ThumbnailImage.acronyms0, ThumbnailImage.acronyms1], 'Acronyms', 'Popular VFR and IFR acronyms'),
    new DemoSelector(SheetName.ifrStrips, [ThumbnailImage.ifrTraining, ThumbnailImage.ifrTraining1], 'IFR Training','Typical IFR Training Flight'),
    new DemoSelector(SheetName.holds, [ThumbnailImage.holds, ThumbnailImage.holds], 'Holds Practice','Full sheet of Holds and Compasses'),
    new DemoSelector(SheetName.paperNavlog, [ThumbnailImage.paperNavlog0, ThumbnailImage.paperNavlog1], 'Paper NavLog', 'Printable Template for Paper Navlog'),
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
const newTemplate = ref(new Template('New','Create a new kneeboard'))
const newChecklist = ref(new Template('New','Create a new checklist'))
const router = useRouter()
const templates = ref<Template[]>([])
const checklists = ref<LibraryChecklist[]>([])
const kneeboards = computed(() => templates.value.filter(t => t.format === TemplateFormat.Kneeboard))

const toast = useToast()
const toaster = useToaster(toast)


onMounted( () => {
    templates.value = currentUser.templates
    checklists.value = currentUser.checklists
    currentUser.addListener(userUpdate);
})

onUnmounted( () => {
    currentUser.removeListener(userUpdate)
})

function onChecklistHelp() {
    UserUrl.open( UserUrl.checklistDigestPage)
}

function onDemoSelection(name:string) {
    // Check if this is a ready-to-print template
    const isReadyToPrint = clickAndPrint.value.some(item => item.name === name)
    
    if (isReadyToPrint && !currentUser.loggedIn) {
        toaster.warning('Sign In Required', 'Please sign in to access Ready to Print templates')
        return
    }
    
    router.push(`/demo/${name}`)
}

// Checklist Library Handlers
const showPlans = ref(false)
const showChecklistDialog = ref(false)
const currentLibraryChecklist = ref<LibraryChecklist | undefined>(undefined)

function onNewTemplate() {
    const templateData = getTemplateBlank();
    templateData.name = 'New Kneeboard';
    templateData.format = TemplateFormat.Kneeboard;
  
    // Save template data to localstore and navigate to template editor
    routeToLocalTemplate(router, templateData);
}

function onNewChecklist() {
    currentLibraryChecklist.value = undefined // New
    showChecklistDialog.value = true
}

function onChecklistDelete(checklist: LibraryChecklist) {
    if (checklist && checklist.id) {
        ChecklistService.delete(checklist, toaster)
    }
    showChecklistDialog.value = false
}

function onChecklistSelection(checklist: LibraryChecklist) {
    currentLibraryChecklist.value = checklist
    showChecklistDialog.value = true
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

function onChecklistApply(checklist: LibraryChecklist) {
    // save to user checklists or refresh existing
    ChecklistService.save(checklist, toaster)
}

function onTemplateSelection(index:number) {
    router.push(`/template/${index}`)
}



function userUpdate() {
    // console.log('[Home.userUpdate]')
    templates.value = currentUser.templates
    checklists.value = currentUser.checklists
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

.kneeboardSection {
    background-color: #f0dfbd;
    border-color: #57422a;
}

.kneeboardSection .header {
    border-bottom-color: #57422a;
}

.badge {
    background-color: #f97316;
    color: white;
    border-radius: 4px;
    padding: 2px 4px;
    font-size: 0.6em;
    vertical-align: middle;
    margin-left: 5px;
}

</style>
