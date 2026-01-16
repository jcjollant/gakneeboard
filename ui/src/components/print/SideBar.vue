<template>
    <div class="sideBar">
        <div class="tailDate">
            <div v-if="showVersion">[v{{ version }}]</div>
            <div v-if="showFlight">Tail#</div>
            <div v-if="showFlight" class="tailBox"></div>
            <div v-if="showFlight">Date</div>
            <div v-if="showName">{{ name }}</div>
        </div>
        <div v-if="showBrand" class="brand">Kneeboard.ga</div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { VerticalInfoBarOption } from '../../models/VerticalInfoBarOption'

const props = defineProps({
    option: { type: String, default: VerticalInfoBarOption.all},
    ver: { type: Number, default: 0},
    name: { type: String, default: ''},
})
const showVersion = ref(true)
const showFlight = ref(true)
const showBrand = ref(true)
const showName = ref(false)
const version = ref(0)

onMounted(() => {
    loadProps( props)
})

watch(props, () => {
    loadProps( props)
})

function loadProps(props:any) {
    version.value = props.ver
    showVersion.value = props.option != VerticalInfoBarOption.hide && version.value > 0
    // console.debug('[SideBar]loadProps page', props.page)
    if(props.option == VerticalInfoBarOption.all) {
        showVersion.value = true
        if(props.name.length > 0) {
            showName.value = true
            showFlight.value = false
        } else {
            showFlight.value = true
            showName.value = false
        }
        showBrand.value = true
    } else if(props.option == VerticalInfoBarOption.version) {
        showVersion.value = version.value > 0
        showFlight.value = false
        showName.value = false
        showBrand.value = true
    } else if(props.option == VerticalInfoBarOption.hide) {
        showVersion.value = false
        showFlight.value = false
        showName.value = false
        showBrand.value = false
    }
}

</script>
<style scoped>
.sideBar {
    display: flex;
    justify-content: space-between;
    padding: 0 2px;
    align-items: end;
}
.tailDate {
    display: flex;
    gap: 10px;
    color: darkblue;
}
.tailBox {
    width: 100px;
}
.brand {
    /* font-size: 20px; */
    font-weight: bold;
    color: darkgrey;
    opacity: 0.5;
}
</style>