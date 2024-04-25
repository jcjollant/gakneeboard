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
    <div class="widgetTitle" @click="onEdit"><div>{{ title }}</div>
        <!-- <button class="editButton" @click="onEdit">Edit</button> -->
    </div>
</template>

<style scoped>
    .editButton {
        position:absolute;
        font-size: 8px;
        right:0;
        top:0;
    }
</style>