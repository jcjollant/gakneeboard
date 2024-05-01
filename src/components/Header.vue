<script setup>
import { onMounted,ref, watch } from 'vue';

const emits = defineEmits(['editMode'])

const props = defineProps({
    title: { type: String, required:true},
})

const title=ref('');

onMounted( () => {
    title.value = props.title
})

watch( props, async() => {
    title.value = props.title
})

function onEdit() {
    emits('editMode');
}

</script>


<template>
    <div class="header clickable" @click="onEdit">
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