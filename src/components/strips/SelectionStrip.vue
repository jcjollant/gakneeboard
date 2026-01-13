<template>
    <div class="stripContent">
        <div class="list">
            <div class="add">Add</div>
            <!-- <Button v-for="s in strips" :label="s.name" @click="emits('selection', s.type)" :title="s.title" :class="s.class"></Button> -->
             <div class="allStrips">
                <div v-for="s in strips" @click="emits('selection', s.type)" class="clickable">
                    <font-awesome-icon :icon="['fas', s.icon]" :class="s.class" :title="s.title" class="stripIcon"></font-awesome-icon>
                    <div>{{ s.name }}</div>
                </div>
             </div>
            <!-- <Button label="Done" @click="emits('done')" link></Button> -->
        </div>
        <div class="actionButtons">
            <Button label="Done" @click="emits('done')"></Button>
            <!-- <font-awesome-icon :icon="['fas', 'check']" class="videoBtn"
                @click="emits('done')" title="Done Adding Strips"></font-awesome-icon> -->
            <font-awesome-icon :icon="['fas', 'video']" class="videoLink"
                @click="UserUrl.open( UserUrl.stripPageVideo)" title="Quick Demo Video"></font-awesome-icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { StripType } from '../../models/StripType'
import Button from 'primevue/button'
import { UserUrl } from '../../lib/UserUrl';

const emits = defineEmits(['selection','done'])
const strips = ref([
    {name: 'Flight', type: StripType.flight, class: 'stripFlight', title: 'Flight Details', icon:'plane'},
    {name: 'Radio', type: StripType.radio, class: 'stripRadio', title: 'Facility Frequencies strip', icon:'headset'},
    {name: 'ATIS', type: StripType.atis, class: 'stripAtis', title: 'ATIS information strip', icon:'cloud-sun-rain'},
    {name: 'CRAFT', type: StripType.craft, class: 'stripCraft', title: 'Departure Clearance', icon:'plane-circle-check'},
    {name: 'Taxi', type: StripType.taxi, class: 'stripTaxi', title: 'Taxi Instructions strip', icon:'road-circle-check'},
    {name: 'Notes', type: StripType.notes, class: 'stripNotes', title: 'An expandable strip to take notes', icon:'pen-to-square'},
])
</script>

<style scoped>
.actionButtons {
    display: flex;
    align-items: center;
    gap: 10px;
}

.list {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: center;
}

.videoLink {
    cursor: pointer;
    color: var(--bg);
}
.videoBtn {
    cursor: pointer;
    color: white;
    background: var(--bg);
    padding: 5px;
    border-radius: 4px;
}
.stripContent {
    border-top: 1px solid black;
    display: flex;
    justify-content: space-between;
    gap: 5px;
    align-items: center;
    padding: 5px 10px;
}
.stripIcon {
    color: var(--bg);
    cursor: pointer;
}
.allStrips {
    display: flex;
    gap: 20px;
}
</style>