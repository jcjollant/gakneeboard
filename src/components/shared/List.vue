<script setup>
import { onMounted, ref } from 'vue';
import Header from './Header.vue';

const emits = defineEmits(['replace'])

const props = defineProps({
    title: { type: String, default: 'List'},
    items: { type: Object, default: []}
})
const items=ref([])

function replaceMe() {
    emits('replace')
}

onMounted(()=> {
    items.value = props.items;
    // console.log(items.value)
})
</script>

<template>
    <div class="widget">
        <Header :title="title" @click="replaceMe" />
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