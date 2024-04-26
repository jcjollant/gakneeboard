<script setup>
import { onMounted, ref } from 'vue';
import WidgetTitle from './WidgetTitle.vue';

const emits = defineEmits(['reset'])

const props = defineProps({
    title: { type: String, default: 'List'},
    items: { type: Object, default: []}
})
const items=ref([])

function resetWidget() {
    emits('reset')
}

onMounted(()=> {
    items.value = props.items;
    // console.log(items.value)
})
</script>

<template>
    <div class="widget">
        <WidgetTitle :title="title" @click="resetWidget" />
        <div class="content list">
            <div v-for="item in items">{{ item }}</div>
        </div>
    </div>
</template>

<style scoped>
.list {
    display: grid;
}
</style>