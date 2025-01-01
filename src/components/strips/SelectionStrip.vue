<template>
    <div class="stripContent">
        <div class="list">
            <div class="add">Add</div>
            <Button v-for="s in strips" :label="s.name" @click="emits('selection', s.type)" :title="s.title" :class="s.class"></Button>
            <!-- <Button label="Done" @click="emits('done')" link></Button> -->
        </div>
        <div class="actionButtons">
            <font-awesome-icon :icon="['fas', 'check']" class="videoBtn"
                @click="emits('done')" title="Done Adding Strips"></font-awesome-icon>
            <font-awesome-icon :icon="['fas', 'video']" class="videoLink"
                @click="UserUrl.open( UserUrl.stripPageVideo)" title="Quick Demo Video"></font-awesome-icon>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { StripType } from '../../assets/StripType'
import Button from 'primevue/button'
import { UserUrl } from '../../lib/UserUrl';

const emits = defineEmits(['selection','done'])
const strips = ref([
    {name: 'Radio', type: StripType.radio, class: 'tileRadio', title: 'Facility Frequencies strip'},
    {name: 'ATIS', type: StripType.atis, class: 'tileAtis', title: 'ATIS information strip'},
    {name: 'Taxi', type: StripType.taxi, class: 'tileTaxi', title: 'Taxi Instructions strip'},
    {name: 'Notes', type: StripType.notes, class: 'tileNotes', title: 'An expandable strip to take notes'},
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
</style>