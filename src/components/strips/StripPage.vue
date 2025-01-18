<template>
    <div class="contentPage pageStrips">
        <Header title="Strips" :page="true" @replace="emits('replace')" @click="editMode=!editMode"></Header>
        <div class="stripContainer">
            <div class="stripList" >
                <template v-if="strips.length" v-for="(s,index) in strips" >
                    <AtisStrip v-if="s == StripType.atis" :edit="editMode" @action="action(index, $event)" :class="'strip'+index"/>
                    <CraftStrip v-if="s == StripType.craft" :edit="editMode" @action="action(index, $event)" :class="'strip'+index"/>
                    <NotesStrip v-if="s == StripType.notes" :edit="editMode" @action="action(index, $event)" :class="'strip'+index"/>
                    <TaxiStrip v-if="s == StripType.taxi" :edit="editMode" @action="action(index, $event)" :class="'strip'+index"/>
                    <RadioStrip v-if="s == StripType.radio" :edit="editMode" @action="action(index, $event)" :class="'strip'+index"/>
                </template>
                <PlaceHolder v-else :title="'No Strip'" :subtitle="editMode ? 'Add New Strips Below' : 'Click Header to Configure'"/>
            </div>
            <SelectionStrip v-if="editMode" @selection="addStrip" @done="editMode=false" class="selectionStrip" />
        </div>
    </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { StripAction } from '@/assets/StripAction';
import { StripPageData } from '@/assets/StripPageData';
import { StripType } from '@/assets/StripType';

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
const props = defineProps<{data:StripPageData}>()
const strips = ref<StripType[]>([])

onMounted(() => {
    // console.log('[StripPage.onMounted]', props.data)
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})


function addStrip(type: StripType) {
    strips.value.push(type)
    update()
}

function action(itemId:number, param:any) {
    // console.log('[StripPage.action]', itemId, param)
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
        console.log('Unknown action', param)
        return
    }
    update()
}

function loadProps(props: any) {
    strips.value = props.data?.list || []
    if(strips.value.length == 0) {
        editMode.value = true
    }
}

// Send an update to parent for storage
function update() {
    const data:StripPageData = {
        list: strips.value
    }
    emits('update', data)
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