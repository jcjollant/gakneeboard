<template>
    <Dropdown v-if="short" v-model="theme" :options="themes" optionLabel="name" optionValue="value" placeHolder="Theme" @change="onChange"></Dropdown>
    <div v-else class="themeSelector">
        <!-- <div>Theme</div> -->
        <div class="sampleList">
            <div v-for="(t,index) in themes" class="sample" :class="t.value" @click="onChange(t)">
                <!-- <RadioButton v-model="theme" :inputId="'theme'+index" name="theme" :value="t.value" @change="onChange" /> -->
                <font-awesome-icon v-if="t.value == theme" icon="fa-solid fa-check" />
                <label :for="'theme'+index">{{ t.name }}</label>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

import RadioButton from 'primevue/radiobutton'
import Dropdown from 'primevue/dropdown'

const emits = defineEmits(['change'])


const theme = ref('theme-yellow')
const short = ref(false)
const themes = ref([
    {name:'Blue', value:'theme-blue'},
    {name:'Green', value:'theme-green'}, 
    {name:'Yellow', value:'theme-yellow'},
    {name:'Purple', value:'theme-purple'},
    {name:'Red', value:'theme-red'},
    {name:'Grey', value:'theme-grey'},
])

//------------------------
// Props management
const props = defineProps({
    theme: { type: String, default: 'theme-yellow' },
    short: { type: Boolean, default: false}
})

function loadProps( newProps) {
    theme.value = newProps.theme;
    short.value = newProps.short;
}

onMounted(() => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})
// End of props management
//------------------------

function onChange(t) {
    theme.value = t.value
    // console.log('[ThemeSelector.onChange] new color', theme.value)
    emits('change', theme.value)
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

.themeSelector {
    /* margin: 5px; */
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
}

.theme-yellow {
    background: lightyellow;
}
.theme-blue {
    background: #b4c6e7;
}
.theme-green {
    background: #c6e0b4;
}
.theme-grey {
    background: #e9e9e9;
}
.theme-purple {
    background: #e9e;
}
.theme-red {
    background-color: pink;
}
</style>