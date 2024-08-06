<script setup>
import { onMounted, ref, watch } from 'vue'

import RadioButton from 'primevue/radiobutton'
import Dropdown from 'primevue/dropdown'

const emits = defineEmits(['change'])


const theme = ref('theme-yellow')
const short = ref(false)
const themes = ref([{name:'Yellow', value:'theme-yellow'},{name:'Blue', value:'theme-blue'},{name:'Green', value:'theme-green'},{name:'Grey', value:'theme-grey'}])

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

function onChange() {
    // console.log('[ThemeSelector.onChange] new color', theme.value)
    emits('change', theme.value)
}

</script>
<template>
    <Dropdown v-if="short" v-model="theme" :options="themes" optionLabel="name" optionValue="value" placeHolder="Theme" @change="onChange"></Dropdown>
    <div class="themeSelector" v-else>
        <div class="sample">Theme</div>
        <div v-for="(t,index) in themes" class="sample" :class="t.value">
            <RadioButton v-model="theme" :inputId="'theme'+index" name="theme" :value="t.value" @change="onChange" />
            <label :for="'theme'+index">{{ t.name }}</label>
        </div>
    </div>

</template>
<style scoped>
.sample {
    padding: 5px;
    border-radius: 3px;
    gap: 5px;
    display: flex;
    align-items: center;
}

.themeSelector {
    display: flex;
    gap: 10px;
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

</style>