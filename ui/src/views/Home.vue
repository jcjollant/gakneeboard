<template>
    <div class="home">


        <Menu></Menu>
        <div class="section templateSection kneeboardSection">
            <div class="header">Kneeboards &amp; Worksheets</div>
            <!-- Kneeboards row -->
            <div class="templateList">
                <TemplateSelector :template="newTemplate" :temporary="true" :clipped="true" src="/thumbnails/new.png" class="templateNew"
                    @selection="onNewTemplate"/>
                <TemplateSelector v-for="(template,index) in userKneeboards" :key="template.id"
                    :template="template" :clipped="true"
                    @selection="onTemplateSelection(template.id)" />
                <div v-if="userKneeboards.length === 0 && userWorksheets.length === 0" class="startHere">
                    <h2>⬅️ Start Here</h2>
                    <div>Your saved kneeboards will be listed here</div>
                </div>
            </div>
            <!-- Worksheets row -->
            <div v-if="userWorksheets.length > 0" class="templateList worksheetList">
                <WorksheetSelector v-for="(template,index) in userWorksheets" :key="template.id"
                    :template="template"
                    @selection="onTemplateSelection(template.id)" />
            </div>
        </div>
        <div class="section templateSection aircraftSection" v-if="currentUser.loggedIn">
            <div class="header">Aircrafts</div>
            <div class="templateList">
                <div class="templateSelector aircraft" @click="onNewAircraft">
                    <div class="preview temporary">
                        <div class="default">
                            <font-awesome-icon icon="fa-plus" />
                        </div>
                    </div>
                    <div class="name">New Aircraft</div>
                </div>
                <AircraftCard v-for="aircraft in aircrafts" :key="aircraft.id" :aircraft="aircraft" @selection="onAircraftSelection" />
            </div>
        </div>
        <div class="section templateSection kneeboardSection systemKneeboards" v-if="systemKneeboards.length > 0">
            <div class="header">System Kneeboards</div>
            <div class="templateList">
                <TemplateSelector v-for="(template,index) in systemKneeboards" 
                    :template="template" :clipped="true"
                    @selection="onTemplateSelection(template.id)" />
            </div>
        </div>
        <div class="section demoSection">
            <div class="header" @click="onDemoSelection(SheetName.default)" title="Templates you could use as a source for your own">Customize and Save</div>
            <div class="templateList">
                <TemplateSelector v-for="(ds,index) in demos" :template="ds.template" :demo="true" :src="ds.src" :class="'demo'+index"
                    @selection="onDemoSelection(ds.name)" />
                <!-- list all demos -->
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
            <div class="header">Checklists from POH <font-awesome-icon :icon="['fas', 'question']" class="inlineButton" @click="onChecklistHelp" title="How do use these checklists?"></font-awesome-icon></div>
            <div class="templateList">
                <TemplateSelector v-for="(p,index) in poh" :template="p.template" :demo="true" :src="'/thumbnails/'+p.src" :class="'poh'+index"
                    @selection="onPohSelection(p)" />
            </div>
        </div>
        <PricingPlans v-if="showPlans" :visible="showPlans" :user="currentUser" @close="showPlans=false" />
        <AircraftEditor v-model:visible="showAircraftEditor" :initialAircraft="currentAircraft" @saved="onAircraftSaved" @deleted="onAircraftDeleted" />

        <ExistingAircraftActionDialog 
            v-model:visible="showExistingAircraftAction" 
            :aircraft="currentAircraft" 
            @edit="onAircraftEdit" 
            @create-fuel-worksheet="onAircraftFuelWorksheet" 
            @delete="onAircraftActionDelete" 
        />
        <NewAircraftSelectionDialog v-model:visible="showAircraftTypeChoice" :userAircrafts="aircrafts" @selected="onAircraftSelected" />
    </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { currentUser, routeToLocalTemplate } from '../assets/data';
import { getTemplateBlank, SheetName, ThumbnailImage } from '../assets/sheetData';
import { TemplateService } from '../services/TemplateService';
import { useToaster } from '../assets/Toaster';
import { UserUrl } from '../lib/UserUrl';

import Menu from '../components/menu/Menu.vue';
import TemplateSelector from '../components/templates/TemplateSelector.vue';
import WorksheetSelector from '../components/templates/WorksheetSelector.vue';
import PricingPlans from './PricingPlans.vue';
import { AircraftService } from '../services/AircraftService';
import AircraftCard from '../components/aircraft/AircraftCard.vue';
import AircraftEditor from '../components/aircraft/AircraftEditor.vue';
import NewAircraftSelectionDialog from '../components/aircraft/NewAircraftSelectionDialog.vue';
import ExistingAircraftActionDialog from '../components/aircraft/ExistingAircraftActionDialog.vue';
import { TemplateFormat, Aircraft } from '@gak/shared';
import { Template, TemplatePage } from '../models/Template';
import { PageType } from '../assets/PageType';
import { LocalStoreService } from '../services/LocalStoreService';
import { AnalyticsService } from '../services/AnalyticsService';

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
    // new DemoSelector(SheetName.checklist, ['checklist-1.png','checklist-2.png'], 'C172 Checklist','A standard C172 Checklist'),
    new DemoSelector(SheetName.checklistShowcase, ['checklist-showcase-1.png','checklist-showcase-2.png'], 'Checklist Showcase','All Checklist Possibilities'),
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
    {code: 'AC', src: 'PA-28-161-CHEROKEE-WARRIOR-II.png', template: new Template('WARRIOR II', 'PA-28-161 WARRIOR II', false, [])},
    {code: 'AD', src: 'PA-28-181-CHEROKEE-ARCHER-II.png', template: new Template('ARCHER II', 'PA-28-181 ARCHER II', false, [])},
])
const newTemplate = ref(new Template('New','Create a new kneeboard'))
const router = useRouter()
const templates = ref<Template[]>([])
const kneeboards = computed(() => templates.value)
const userKneeboards = computed(() => templates.value.filter(t => !t.system && t.format === TemplateFormat.Kneeboard))
const userWorksheets = computed(() => templates.value.filter(t => !t.system && t.format === TemplateFormat.FullPage))
const systemKneeboards = computed(() => templates.value.filter(t => t.system))

const toast = useToast()
const toaster = useToaster(toast)


onMounted( () => {
    templates.value = currentUser.templates
    if (currentUser.loggedIn) {
        loadAircrafts()
    }
    currentUser.addListener(userUpdate);
    document.title = 'GA Kneeboard | Aviation Kneeboard. Your way.';
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


const showPlans = ref(false)

function onNewTemplate() {
    const templateData = getTemplateBlank();
    templateData.name = 'New Kneeboard';
    templateData.format = TemplateFormat.Kneeboard;
  
    // Save template data to localstore and navigate to template editor
    routeToLocalTemplate(router, templateData);
}


function onPohSelection(poh:Poh) {
    const code = poh.code
    toaster.info('Loading Checklist',poh.template.name)
    TemplateService.getPublication(code).then( (templateData: any) => {
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


function onTemplateSelection(index:number) {
    router.push(`/template/${index}`)
}



function userUpdate() {
    // console.log('[Home.userUpdate]')
    templates.value = [...currentUser.templates]
    if (currentUser.loggedIn && aircrafts.value.length === 0) {
        loadAircrafts()
    }
    // console.log('[Home.userUpdate] template length', templates.value.length)
}

// Aircraft Management
const aircrafts = ref<Aircraft[]>([]);
const showAircraftEditor = ref(false);
const currentAircraft = ref<Aircraft | null>(null);

const showAircraftTypeChoice = ref(false);
const showExistingAircraftAction = ref(false);

async function loadAircrafts() {
    aircrafts.value = LocalStoreService.getAircrafts();
    if (AircraftService.wasFetchedThisSession) {
        return;
    }
    
    try {
        const fetched = await AircraftService.list();
        if (fetched) {
            aircrafts.value = fetched;
            LocalStoreService.saveAircrafts(fetched);
            AircraftService.wasFetchedThisSession = true;
        }
    } catch (e) {
        console.error(e);
    }
}

function onNewAircraft() {
    showAircraftTypeChoice.value = true;
}

function onAircraftSelected(aircraft: Aircraft | null) {
    currentAircraft.value = aircraft;
    showAircraftEditor.value = true;
}

function onAircraftSelection(aircraft: Aircraft) {
    currentAircraft.value = aircraft;
    showExistingAircraftAction.value = true;
}

function onAircraftEdit(aircraft: Aircraft) {
    currentAircraft.value = aircraft;
    showAircraftEditor.value = true;
}

function onAircraftFuelWorksheet(aircraft: Aircraft) {
    AnalyticsService.viewFuelWorksheet('aircraft_card');
    const templateData = getTemplateBlank();
    templateData.name = aircraft.tailNumber + ' Fuel Worksheet';
    templateData.desc = 'Fuel Worksheet for ' + aircraft.tailNumber;
    templateData.format = TemplateFormat.FullPage;
    templateData.data = [new TemplatePage(PageType.fuelWorksheet, 'Fuel Worksheet', {
        aircraftTailNumber: aircraft.tailNumber,
        hangarItems: [],
        aircraftItems: [],
        flightRules: 'VFR',
        ifrAlternateMinutes: 0,
        personalBufferMinutes: 45,
        taxiFuelGallons: 0,
        legs: []
    })];
    
    // Save template data to localstore and navigate to template editor
    routeToLocalTemplate(router, templateData);
}

async function onAircraftActionDelete(aircraft: Aircraft) {
    if (!aircraft.id) return
    try {
        const success = await AircraftService.delete(aircraft.id)
        if (success) {
            onAircraftDeleted(aircraft.id)
        }
    } catch (err) {
        console.error(err)
        toaster.error('Delete Failed', 'Could not delete the aircraft')
    }
}

function onAircraftSaved(saved: Aircraft) {
    toaster.success('Aircraft Saved', saved.tailNumber);
    const index = aircrafts.value.findIndex((a: Aircraft) => a.id === saved.id);
    if (index > -1) {
        aircrafts.value[index] = saved;
    } else {
        aircrafts.value.push(saved);
        aircrafts.value.sort((a: Aircraft, b: Aircraft) => a.tailNumber.localeCompare(b.tailNumber));
    }
    LocalStoreService.saveAircrafts(aircrafts.value);
}

function onAircraftDeleted(id: number) {
    toaster.success('Aircraft Deleted', 'The aircraft has been removed');
    aircrafts.value = aircrafts.value.filter((a: Aircraft) => a.id !== id);
    LocalStoreService.saveAircrafts(aircrafts.value);
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
    padding-bottom: 60px;
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

.worksheetList {
    border-top: 1px dashed #57422a;
    margin-top: 0;
    align-items: flex-start;
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

.aircraftSection {
    background-color: #e0f2fe;
    border-color: #0369a1;
}

.aircraftSection .header {
    border-bottom-color: #0369a1;
}

.systemKneeboards {
    background-color: #aaeeaa;
    border-color: #22aa22;
}

.systemKneeboards .header {
    border-bottom-color: #22aa22;
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

.startHere {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    text-align: left;
    justify-content: center;
}
.startHere h2 {
    margin: 0;
}

.aircraftSection .templateSelector.aircraft {
    display: flex;
    flex-flow: column;
    justify-content: center;
    cursor: pointer;
    width: calc(var(--page-width) / 5 + 6px);
}

.aircraftSection .preview.temporary {
    background-color: transparent;
    border: 3px dashed lightgrey;
    border-radius: 5px;
    height: calc(var(--page-width) / 5 + 6px);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s;
}

.aircraftSection .preview.temporary:hover {
    transform: scale(1.05);
}

.aircraftSection .default {
    font-size: 2.5rem;
    color: lightgrey;
}

.aircraftSection .name {
    text-align: center;
    font-size: small;
    padding: 0.5rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
