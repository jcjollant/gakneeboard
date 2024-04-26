<script setup>
import { onMounted,ref, watch } from 'vue';

const emits = defineEmits(['editMode'])

const props = defineProps({
    title: { type: String, required:true},
    info: {type: Boolean, default: false},
})

const title=ref('');
const info=ref(false)

onMounted( () => {
    title.value = props.title
    info.value = props.info
})

watch( props, async() => {
    title.value = props.title
    info.value = props.info
})

function onEdit() {
    emits('editMode');
}

</script>


<template>
    <div class="widgetTitle clickable" @click="onEdit"><div>{{ title }}</div>
    <div v-if="info" class="info"></div>
    </div>
</template>

<style scoped>
    .editButton {
        position:absolute;
        font-size: 8px;
        right:0;
        top:0;
    }
    .info {
        position: absolute;
        left:0;
        top:0;
        width:40px;
        height: 100%;
        border-right: 1px dashed darkgrey;
    }
    .widgetTitle {
        text-align: center;
        padding: 5px;
        border-bottom: 1px dashed darkgrey;
        position: relative;
    }

</style>