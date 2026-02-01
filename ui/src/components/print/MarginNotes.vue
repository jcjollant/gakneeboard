<template>
    <div class="marginNotes">
        <div class="vibNotes">
            <div v-if="showVersion">[v{{ version }}]</div>
            <div v-if="showName">{{ name }}</div>
            <div v-if="showFlight" class="vibTail">Tail#</div>
            <div v-if="showDate" class="vibDate">Date</div>
        </div>
        <div v-if="showBrand" class="vibBrand">Kneeboard.ga</div>
    </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { VerticalInfoBarContent } from '../../models/VerticalInfoBarOption'

const props = defineProps({
    show: { type: Boolean, default: true },
    items: { type: Array, default: () => []},
    ver: { type: Number, default: 0},
    name: { type: String, default: ''},
})
const showVersion = ref(true)
const showFlight = ref(true)
const showDate = ref(true)
const showBrand = ref(true)
const showName = ref(false)
const version = ref(0)
const currentDate = ref('')

onMounted(() => {
    loadProps( props)
})

watch(props, () => {
    loadProps( props)
})

function loadProps(props:any) {
    version.value = props.ver
    const items = props.items || []
    
    // Always show brand? The prompt didn't say. 'Kneeboard.ga' was "Brand" in old code.
    // Old code showed brand unless option == hide.
    showBrand.value = props.show 

    if (!props.show) {
        showVersion.value = false
        showFlight.value = false
        showDate.value = false
        showName.value = false
        return
    }

    showVersion.value = items.includes(VerticalInfoBarContent.Version)
    showName.value = items.includes(VerticalInfoBarContent.PageName) && props.name.length > 0
    showFlight.value = items.includes(VerticalInfoBarContent.Tail)
    showDate.value = items.includes(VerticalInfoBarContent.Date)
}

</script>
<style scoped>
.marginNotes {
    display: flex;
    justify-content: space-between;
    padding: 0 2px;
    align-items: end;
}
.vibNotes {
    display: flex;
    gap: 20px;
    color: darkblue;
}
.vibTail {
    padding-right: 100px;
}
.vibDate {
    padding-right: 100px;
}
.vibBrand {
    /* font-size: 20px; */
    font-weight: bold;
    color: darkgrey;
    opacity: 0.5;
}
</style>