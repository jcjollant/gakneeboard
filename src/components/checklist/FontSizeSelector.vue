<template>
    <div class="fontSelector">
        <div class="sampleList">
            <div v-for="(c,index) in choices" class="sample" :class="{selected:c.value == model}" @click="onChange(c)">
                <!-- <font-awesome-icon v-if="c.value == model" icon="fa-solid fa-check" /> -->
                <label>{{ c.name }}</label>
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

.fontSelector {
    /* margin: 5px; */
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
}

.selected {
    background: #b4c6e7;
}
</style>