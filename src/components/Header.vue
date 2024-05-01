<script setup>
import { onMounted,ref, watch } from 'vue';

const props = defineProps({
    title: { type: String, required:true},
    clickable: { type: Boolean, default:true}
})

const title=ref('');
const clickable=ref(false)

onMounted( () => {
    title.value = props.title
    clickable.value = props.clickable
})

watch( props, async() => {
    title.value = props.title
    clickable.value = props.clickable
})

</script>


<template>
    <div class="header" :class="{ clickable: clickable }">
        <div>{{ title }}</div>
    </div>
</template>

<style scoped>
    .header {
        text-align: center;
        padding: 5px;
        border-bottom: 1px dashed darkgrey;
        position: relative;
        overflow: hidden;
        height: 24px;
    }

</style>