<template>
    <div class="sideBar">
        <div class="tailDate">
            <div v-if="showVersion">[v{{ version }}]</div>
            <div v-if="showTail">Tail#</div>
            <div v-if="showTail" class="tailBox"></div>
            <div v-if="showDate">Date</div>
        </div>
        <div v-if="showBrand" class="brand">Kneeboard.ga</div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { VerticalInfoBarOption } from '../../model/VerticalInfoBarOption'

const props = defineProps({
    option: { type: String, default: VerticalInfoBarOption.all},
    ver: { type: Number, default: 0},
})
const showVersion = ref(true)
const showTail = ref(true)
const showDate = ref(true)
const showBrand = ref(true)
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
    showTail.value = props.option == VerticalInfoBarOption.all
    showDate.value = props.option == VerticalInfoBarOption.all
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