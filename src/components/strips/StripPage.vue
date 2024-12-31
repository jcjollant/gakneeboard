<template>
    <div class="contentPage stripPage">
        <Header title="Strips" :page="true" @replace="emits('replace')" @click="editMode=!editMode"></Header>
        <div class="stripContainer">
            <div class="stripList" >
                <div v-if="strips.length" v-for="(s,index) in strips" >
                    <AtisStrip v-if="s == StripType.atis" :edit="editMode" @action="action(index, $event)" />
                    <TaxiStrip v-if="s == StripType.taxi" :edit="editMode" @action="action(index, $event)"/>
                    <NotesStrip v-if="s == StripType.notes" :edit="editMode" @action="action(index, $event)"/>
                </div>
            </div>
            <SelectionStrip v-if="editMode" @selection="addStrip" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { StripAction } from '../../assets/StripAction';
import { StripType } from '../../assets/StripType';

import AtisStrip from '../atis/AtisStrip.vue';
import Header from '../shared/Header.vue';
import NotesStrip from '../notes/NotesStrip.vue';
import SelectionStrip from './SelectionStrip.vue';
import TaxiStrip from './TaxiStrip.vue';

const editMode = ref(true)
const emits = defineEmits(['replace'])
const strips = ref<StripType[]>([])

function addStrip(type: StripType) {
    strips.value.push(type)
}

function action(itemId:number, param:any) {
    console.log('[StripPage.action]', itemId, param)
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
    }
}

</script>

<style scoped>
.stripContainer {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}
.stripList {
    display: flex;
    flex-flow: column;
    gap: 5px;
    padding: 5px;
}
.stripPage {
    display: flex;
    flex-direction: column;
    background: var(--bg-strip);
}
</style>