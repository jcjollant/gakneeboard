<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
    title: { type: String, default: 'List'},
    items: { type: String, default: []}
})
const items=ref([])

onMounted(()=> {
    items.value = props.items.split(',')
    // console.log(items.value)
})
</script>

<template>
    <div class="widget">
        <div class="widgetTitle">{{title}}</div>
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