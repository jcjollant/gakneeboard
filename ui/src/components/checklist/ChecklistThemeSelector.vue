<template>
    <Dropdown v-if="short" v-model="model" :options="themes" optionLabel="name" optionValue="value" placeHolder="Theme"></Dropdown>
    <div v-else class="themeSelector">
        <!-- <div>Theme</div> -->
        <div class="sampleList">
            <div v-for="(t,index) in themes" class="sample" :class="t.value" @click="model = t.value">
                <!-- <RadioButton v-model="model" :inputId="'theme'+index" name="theme" :value="t.value" /> -->
                <font-awesome-icon v-if="t.value == model" icon="fa-solid fa-check" />
                <label :for="'theme'+index">{{ t.name }}</label>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'

import Dropdown from 'primevue/dropdown'
import { ChecklistTheme } from '../../models/Checklist'

const model = defineModel<ChecklistTheme>()

const themes = ref([
    {name:'Blue', value:ChecklistTheme.blue},
    {name:'Green', value:ChecklistTheme.green}, 
    {name:'Yellow', value:ChecklistTheme.yellow},
    {name:'Purple', value:ChecklistTheme.purple},
    {name:'Red', value:ChecklistTheme.red},
    {name:'Grey', value:ChecklistTheme.grey},
])

const props = defineProps({
    short: { type: Boolean, default: false}
})

</script>
<style scoped>
.sampleList {
    /* padding: 5px; */
    border-radius: 3px;
    display: flex;
    align-items: center;
    width: 100%;
    font-size: 0.9rem;
}

.sample {
    padding: 5px 10px;
    flex-basis: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
}

.sample > label {
    cursor: pointer;
}

.themeSelector {
    /* margin: 5px; */
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
}

.yellow {
    background: lightyellow;
}
.blue {
    background: #b4c6e7;
}
.green {
    background: #c6e0b4;
}
.grey {
    background: #e9e9e9;
}
.purple {
    background: #e9e;
}
.red {
    background-color: pink;
}
</style>