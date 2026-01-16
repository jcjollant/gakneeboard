<template>
    <div class="fontSelector">
        <div class="sampleList">
            <div v-for="(c,index) in choices" class="sample" :class="{selected:c.value == model}" @click="onChange(c)">
                <!-- <font-awesome-icon v-if="c.value == model" icon="fa-solid fa-check" /> -->
                <label :class="'font-' + c.value">{{ c.name }}</label>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ChecklistFont } from '../../models/Checklist'

const model = defineModel()
const choices = ref([
    {name:'XS', value:ChecklistFont.smaller},
    {name:'S', value:ChecklistFont.small},
    {name:'Medium', value:ChecklistFont.medium}, 
    {name:'L', value:ChecklistFont.large},
    {name:'XL', value:ChecklistFont.larger},
])


function onChange(choice) {
    model.value = choice.value
    // console.log('[FontSizeSelector.onChange]', choice.value)
}

</script>
<style scoped>
.sampleList {
    /* padding: 5px; */
    border-radius: 3px;
    border: 1px solid lightgrey;
    display: flex;
    align-items: center;
    width: 100%;
    font-size: 0.9rem;
    overflow: hidden; /* Ensure child background doesn't bleed */
}

.sample {
    padding: 5px 10px;
    flex-basis: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer; /* moved from fontSelector */
}

.sample:hover:not(.selected) {
    background-color: #eee;
}

.sample > label {
    cursor: pointer;
}

.fontSelector {
    /* margin: 5px; */
    display: flex;
    align-items: center;
    width: 100%;
}

.selected {
    background: #b4c6e7;
    /* or var(--bg-choice-active) if available, but keeping existing color logic for now unless requested */
}
</style>