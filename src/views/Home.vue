<template>
    <div class="home">
        <Toast />
        <!-- <div class="section">
            <div class="header">What's New?</div>
        </div> -->
        <Menu />
        <div class="section">
            <div class="header">Templates</div>
            <div class="templateList">
                <TemplateSelector :template="newTemplate" :temporary="true" src="/thumbnails/new.png"
                    @selection="onNewTemplate"/>
                <TemplateSelector :template="localTemplate" :temporary="true" 
                    @selection="onTemplateSelection(0)"/>
                <TemplateSelector v-if="user.templates.length > 0" v-for="(template,index) in user.templates" 
                    :template="template"  
                    @selection="onTemplateSelection(template.id)" />
                <PlaceHolder v-else title="No Templates (yet)" subtitle="Your saved templates will show here"/>
            </div>
        </div>
        <div class="section">
            <div class="header">Demos</div>
            <div class="templateList">
                <TemplateSelector v-for="(d) in demos" :template="d.template" :demo="true" :src="'/thumbnails/'+d.src"
                    @selection="onDemoSelection(d.name)" />
                <!-- list all demos -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { newCurrentUser } from '../assets/data';
import { CurrentUser } from '../assets/CurrentUser';
import { useRouter } from 'vue-router';
import { LocalStore } from '../lib/LocalStore';
import { getTemplateDataFromName, SheetName } from '../assets/sheetData';
import { useToast } from 'primevue/usetoast';
import { getToastError, getToastWarning } from '../assets/toast';
import Menu from '../components/menu/Menu.vue';
import PlaceHolder from '../components/shared/PlaceHolder.vue';
import TemplateSelector from '../components/templates/TemplateSelector.vue';
import Toast from 'primevue/toast';

const demos = ref([
    {name: SheetName.default, src: 'default.png', template: {name:'Default',desc:'Tiles and Checklist'}},
    {name: SheetName.checklist, src: 'checklist.png', template: {name:'Checklist',desc:'Checklists syntax Showcase'}},
    {name: SheetName.tiles, src: 'tiles.png', template: {name:'Tiles',desc:'Tiles Gallery'}},
    {name: SheetName.navlog, src: 'navlog.png', template: {name:'NavLog',desc:'Navlog page and companion tiles'}},
    {name: SheetName.skyhawk, src: 'skyhawk.png', template: {name:'C172 Reference',desc:'A sample Skyhawk Reference'}},
    {name: SheetName.charts, src: 'charts.png', template: {name:'Charts',desc:'Airport Diagram and Instrument Approach'}},
])
const localTemplate = ref({name:'Local',desc:'Resume your last session'})
const newTemplate = ref({name:'New',desc:'Create a new template'})
const user = ref(new CurrentUser())
const router = useRouter()
const toast = useToast()

onMounted( () => {
  user.value = newCurrentUser
  localTemplate.value = user.value.templates[0]
  setTimeout(() => {
    checkThumbnails()
  }, 500)
})

function checkThumbnails() {
    for(const t of newCurrentUser?.templates) {
        if(!LocalStore.thumbnailGet(t.id)) {
            toast.add(getToastWarning('Missing Thumbnails', 'Open Templates to recreate thumbnails', 5000))
            return;
        }
    }
}

function onDemoSelection(name) {
    const templateData = getTemplateDataFromName(name)
    if(!templateData) {
        toast.add(getToastError('Load Demo', 'Unknown Demo Template'))
        return;
    }
    // Save demo data to localstore
    LocalStore.saveTemplate(templateData);
    // Load localstore
    router.push( '/template/0')
}

function onNewTemplate() {
    const templateData = getTemplateDataFromName(SheetName.new)
    templateData.name = 'New Template'

    // Save demo data to localstore
    LocalStore.saveTemplate(templateData);
    // Load localstore
    router.push( '/template/new')
}

function onTemplateSelection(index) {
    router.push( '/template/' + index)
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