<template>
    <div class="sideBar">
        <div class="tailDate">
            <div v-if="version > 0">[v{{ version }}]</div>
            <div>Tail#</div>
            <div class="tailBox"></div>
            <div>Date</div>
        </div>
        <div class="brand">Kneeboard.ga</div>
    </div>
</template>
<script lang="ts" setup>
import { ref, defineProps, onMounted, watch } from 'vue'
const props = defineProps({
    ver: { type: Number, default: 0},
})
const version = ref(0)

onMounted(() => {
    version.value = props.ver
})

watch(props, () => {
    version.value = props.ver
})

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