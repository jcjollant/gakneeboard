<template>
    <div class="home">
        <Toast />
        <Menu></Menu>
        <div class="section templateSection">
            <div class="header">Templates</div>
            <div class="templateList">
                <TemplateSelector :template="newTemplate" :temporary="true" src="/thumbnails/new.png" class="templateNew"
                    @selection="onNewTemplate"/>
                <TemplateSelector :template="localTemplate" :temporary="true" src="local"
                    @selection="onTemplateSelection('local')"/>
                <TemplateSelector v-if="templates.length > 0" v-for="(template,index) in templates" 
                    :template="template"  
                    @selection="onTemplateSelection(template.id)" />
                <div v-else>
                    <PlaceHolder title="No Templates (yet)" subtitle="Your saved templates will show here"/>
                </div>
            </div>
        </div>
        <div class="section demoSection">
            <div class="header">Demos</div>
            <div class="templateList">
                <TemplateSelector v-for="(d,index) in demos" :template="d.template" :demo="true" :src="'/thumbnails/'+d.src" :class="'demo'+index"
                    @selection="onDemoSelection(d.name)" />
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

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { currentUser, routeToLocalTemplate } from '../assets/data';
import { useRouter } from 'vue-router';
import { getTemplateBlank, getTemplateDataFromName, SheetName } from '../assets/sheetData';
import { useToast } from 'primevue/usetoast';
import { getToastError } from '../assets/toast';
import Menu from '../components/menu/Menu.vue';
import PlaceHolder from '../components/shared/PlaceHolder.vue';
import TemplateSelector from '../components/templates/TemplateSelector.vue';
import Toast from 'primevue/toast';

const demos = ref([
    {name: SheetName.default, src: 'default.png', template: {name:'Default',desc:'Tiles and Checklist'}},
    {name: SheetName.skyhawk, src: 'skyhawk.png', template: {name:'C172 Reference',desc:'A sample Skyhawk Reference'}},
    {name: SheetName.checklist, src: 'checklist.png', template: {name:'Checklist',desc:'Checklists syntax Showcase'}},
    {name: SheetName.tiles, src: 'tiles.png', template: {name:'Tiles',desc:'Tiles Gallery'}},
    {name: SheetName.navlog, src: 'navlog.png', template: {name:'NavLog',desc:'Navlog page and companion tiles'}},
    {name: SheetName.charts, src: 'charts.png', template: {name:'Charts',desc:'Airport Diagram and Instrument Approach'}},
    {name: SheetName.holds, src: 'holds.png', template: {name:'Holds Practice',desc:'Full sheet of Holds and Compasses'}},
    {name: SheetName.ifrflight, src: 'strips.png', template: {name:'IFR Flight',desc:'Strips for IFR flights notekeeping'}},
])
// const poh = ref([
//     {code: 'AA', src: 'C172SGFC700.png', template: {name:'C172S GFC700',desc:'CESSNA MODEL 172S NAV III GFC 700 AFCS'}},
// ])
const localTemplate = ref({name:'Local',desc:'Resume your last session'})
const newTemplate = ref({name:'New',desc:'Create a new template'})
const router = useRouter()
const templates = ref([])
const toast = useToast()

onMounted( () => {
    // console.log('[Home.onMounted] templates', currentUser.templates.length)
    templates.value = currentUser.templates
    // console.log('[Home.onMounted] template length', templates.value.length)
    currentUser.addListener(userUpdate);
    localTemplate.value = templates.value[0]
    // setTimeout(() => {
    //     checkThumbnails()
    // }, 500)
})

onUnmounted( () => {
    // console.log('[Home.onUnmounted]')
    currentUser.removeListener(userUpdate)
})

function onDemoSelection(name) {
    const templateData = getTemplateDataFromName(name)
    if(!templateData) {
        toast.add(getToastError('Load Demo', 'Unknown Demo Template'))
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