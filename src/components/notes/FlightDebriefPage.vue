<template>
    <div class="flightDebrief contentPage">
        <Header title="Flight Debrief" :page="true" :displayMode="false" leftButton="settings"
            @replace="emits('replace')" @click="toggleEditMode"></Header>
        <div v-if="editMode" class="editMode">
            <Textarea class='list' rows="25" cols="48" v-model="categoriesText" placeholder="Enter one category per line, up to 25 lines" style="resize:none"></Textarea>
            <div class="autoCategories">
                <Button label="VFR Maneuvers" @click="addCategories(vfrManeuvers)"></Button>
                <Button label="IFR Maneuvers" @click="addCategories(ifrManeuvers)"></Button>
            </div>
            <ActionBar @apply="onApply" @cancel="editMode=false" />
        </div>
        <div v-else class="fdGrid">
            <div class="fdLine">
                <div class="fdIcons brb">
                    <font-awesome-icon icon="fa-regular fa-face-smile" style="color: darkgreen;"/>
                    <font-awesome-icon icon="fa-regular fa-face-meh" style="color: darkgrey;"/>
                    <font-awesome-icon icon="fa-regular fa-face-frown" style="color: red;" />
                </div>
                <div>Notes</div>
            </div>
            <div v-for="index in 25" class="fdLine">
                <div class="fdSpacers brb">
                    <div class="br">&nbsp;</div>
                    <div class="br">&nbsp;</div>
                    <div>&nbsp;</div>
                </div>  
                <div class="category">{{ index <= categories.length ? categories[index - 1] : '' }}</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>

import { onMounted, ref, watch } from 'vue';
import Header from '../shared/Header.vue';
import ActionBar from '../shared/ActionBar.vue';
import Button from 'primevue/button'
import Textarea from 'primevue/textarea';

const categories = ref([])
const categoriesText = ref()
const editMode = ref(false)
const emits = defineEmits(['replace', 'update']);
const props = defineProps({
    data: {type:Object, default: null}
})
const ifrManeuvers = ["RNAV LPV Apch", "RNAV LNAV Apch", "ILS Apch", "LOC Apch", "VOR/DME Apch", "Holds", "Track", "Intercept"]
const vfrManeuvers = [
    "Slow Flight",
    "Power Off Stall",
    "Power On Stall",
    "Turn Around a Point",
    "Rectangular Course",
    "S Turns",
    "Short Field Landing",
    "Soft Field Landing"
    ];


onMounted( () => {
    loadProps(props)
})

watch( props, () => {
    loadProps(props)
})

function addCategories(list:string[]) {
    let newText = categoriesText.value
    if(newText.length) {
        newText += '\n'
    }
    newText += list.join('\n')
    categoriesText.value = newText;
}

function loadProps(props:any) {
    // console.debug('[FlightDebriefPage]', props)
    // restore categories
    if(props && props.data && props.data.categories && props.data.categories.length > 0) {
        categories.value = props.data.categories
    } else {
        categories.value = []
    }
}

function onApply() {
    // extract categories from text
    categories.value = categoriesText.value.split('\n')

    // TODO save new values
    const data = { categories: categories.value}
    emits('update', data)

    editMode.value = false;
}

function toggleEditMode() {
    editMode.value = !editMode.value
    if(editMode.value) {
        categoriesText.value = categories.value.join('\n')
    }
}

</script>
<style scoped>
.fdGrid {
    display: flex;
    flex-direction: column;
}
.fdLine {
    display: grid;
    grid-template-columns: 1fr 4fr;
    border-bottom: 2px dashed lightgrey;
    height: 30px;
}
.fdIcons {
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.brb {
    border-right: 1px solid black;
}
.fdSpacers {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}
.br {
    border-right: 1px solid darkgrey;
}
.category {
    padding-left: 10px;
    line-height: 28px;
    text-align: left;
}
.editMode {
    padding: 5px;
}
.autoCategories {
    display: flex;
    gap: 10px;
    justify-content: center;
}
</style>