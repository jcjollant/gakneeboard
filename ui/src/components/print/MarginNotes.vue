<template>
    <div class="marginNotes">
        <div class="vibNotes">
            <div v-if="showVersionOrName">[{{ versionAndName }}]</div>
            <div v-if="showTail" class="vibTail">Tail#</div>
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
const showTail = ref(true)
const showDate = ref(true)
const showBrand = ref(true)
const showVersionOrName = ref(true)
const versionAndName = ref('')

onMounted(() => {
    loadProps( props)
})

watch(props, () => {
    loadProps( props)
})

function loadProps(props:any) {
    const items = props.items || []
    
    // Always show brand? The prompt didn't say. 'Kneeboard.ga' was "Brand" in old code.
    // Old code showed brand unless option == hide.
    showBrand.value = props.show 

    if (!props.show) {
        showVersionOrName.value = false
        showTail.value = false
        showDate.value = false
        return
    }

    const buffer = []
    const showVersion = items.includes(VerticalInfoBarContent.Version)
    const showName = items.includes(VerticalInfoBarContent.PageName)
    if( props.ver > 0 && showVersion) buffer.push('v'+props.ver.toString())
    if( props.name.length > 0 && showName) buffer.push(props.name)
    versionAndName.value = buffer.join(' - ')

    showVersionOrName.value = showVersion || showName
    showTail.value = items.includes(VerticalInfoBarContent.Tail)
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
    gap: 10px;
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