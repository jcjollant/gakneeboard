<template>

    <div class="stripContent">
        <div class="list">
            <div class="add">Add</div>
            <Button v-for="s in strips" :label="s.name" @click="emits('selection', s.type)" :title="s.title" :class="s.class"></Button>
            <Button label="Done" @click="emits('done')" link></Button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { StripType } from '../../assets/StripType'
import Button from 'primevue/button'

const emits = defineEmits(['selection','done'])
const strips = ref([
    {name: 'ATIS', type: StripType.atis, class: 'tileAtis', title: 'ATIS information strip'},
    {name: 'Radio', type: StripType.radio, class: 'tileRadio', title: 'Facility Frequencies strip'},
    {name: 'Taxi', type: StripType.taxi, class: 'tileTaxi', title: 'Taxi Instructions strip'},
    {name: 'Notes', type: StripType.notes, class: 'tileNotes', title: 'An expandable strip to take notes'},
])
</script>

<style scoped>

.list {
    display: flex;
    gap: 10px;
    justify-content: flex-start;
    align-items: center;
    padding: 5px 10px;
    border-top: 1px solid black;
}
</style>