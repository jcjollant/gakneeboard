<template>
    <div class="contentPage pageStrips">
        <Header title="Strips" :page="true" @replace="emits('replace')" @click="editMode=!editMode"></Header>
        <div class="stripContainer">
            <div class="stripList" >
                <template v-if="strips.length" v-for="(s,index) in strips" >
                    <AtisStrip v-if="s.type == StripType.atis" :class="'strip'+index"
                        :edit="editMode" :header="!index || strips[index-1].type != StripType.atis"
                        @action="action(index, $event)"/>
                    <CraftStrip v-if="s.type == StripType.craft" :edit="editMode" @action="action(index, $event)" :class="'strip'+index"/>
                    <NotesStrip v-if="s.type == StripType.notes" :edit="editMode" @action="action(index, $event)" :class="'strip'+index"/>
                    <TaxiStrip v-if="s.type == StripType.taxi" :edit="editMode" @action="action(index, $event)" :class="'strip'+index"/>
                    <RadioStrip v-if="s.type == StripType.radio" :edit="editMode" @action="action(index, $event)" 
                        :data="strips[index].data" :header="!index || strips[index-1].type != StripType.radio"
                        @update="onUpdate(index, $event)"/>
                </template>
                <PlaceHolder v-else :title="'No Strip'" :subtitle="editMode ? 'Add New Strips Below' : 'Click Header to Configure'"/>
            </div>
            <SelectionStrip v-if="editMode" @selection="addStrip" @done="editMode=false" class="selectionStrip" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { StripAction } from '../../assets/StripAction';
import { StripPageData } from '../../assets/StripPageData';
import { StripSetting } from '../../model/StripSetting.ts';
import { StripType } from '../../model/StripType';

import AtisStrip from '../atis/AtisStrip.vue';
import CraftStrip from './CraftStrip.vue';
import Header from '../shared/Header.vue';
import NotesStrip from '../notes/NotesStrip.vue';
import SelectionStrip from './SelectionStrip.vue';
import TaxiStrip from './TaxiStrip.vue';
import PlaceHolder from '../shared/PlaceHolder.vue';
import RadioStrip from '../radios/RadioStrip.vue';

const editMode = ref(false)
const emits = defineEmits(['replace','update'])
const props = defineProps<{data:any}>()
const strips = ref<StripSetting[]>([])

onMounted(() => {
    // console.log('[StripPage.onMounted]', props.data)
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})


function addStrip(type: StripType) {
    strips.value.push(new StripSetting(type))
    update()
}

function action(itemId:number, param:any) {
    // console.debug('[StripPage.action]', itemId, param)
    if(param == StripAction.remove) {
        strips.value.splice(itemId, 1)
    } else if( param == StripAction.moveUp) {
        if(itemId > 0) {
            const tmp = strips.value[itemId-1]
            strips.value[itemId-1] = strips.value[itemId]
            strips.value[itemId] = tmp
        }
    } else if( param == StripAction.moveDown) {
        if(itemId < strips.value.length-1) {
            const tmp = strips.value[itemId+1]
            strips.value[itemId+1] = strips.value[itemId]
            strips.value[itemId] = tmp
        }
    } else {
        console.warn('Unknown action', param)
        return
    }
    update()
}

function loadProps(props: any) {
    // console.log('[StripPage.loadProps]', props)
    if('list' in props.data) {
        // console.log('[StripPage.loadProps]', props.data)
        strips.value = props.data.list.map((s:StripType) => new StripSetting(s))
    } else if(props.data && props.data.length > 0 ) {
        strips.value = props.data
    } else {
        strips.value = []
    }
    // switch to edit mode if there is nothing in the list
    if(strips.value.length == 0) {
        editMode.value = true
    }
    // console.log('[StripPage.loadProps] strips', strips.value)
}

function onUpdate(index: number, data: any) {
    // console.debug('[StripPage.onUpdate]', index, data)
    strips.value[index].data = data
    update()
}
// Send an update to parent for storage
function update() {
    emits('update', strips.value)
}

</script>

<style scoped>
.stripContainer {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex-grow: 1;
}
.stripList {
    display: flex;
    flex-flow: column;
    gap: 5px;
    padding: 5px;
    flex-grow: 1;
}
.pageStrips {
    display: flex;
    flex-direction: column;
    background: var(--bg-strip);
}
</style>