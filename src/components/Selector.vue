<!-- This component allows the user to pick a widget -->
<script setup>
import {ref} from 'vue';

const items = ref(['Runway','ATIS','List','Notes'])
const emits = defineEmits(['loadWidget'])

function loadWidget(name) {
    // console.log('load widget ' + name)
    emits('loadWidget', name)
}

</script>

<template>
    <div class="widget">
        <div class="widgetTitle">Widget Selection</div>
        <div class="content list">
            <button v-for="item in items" class="item" @click="loadWidget(item)">{{ item }}</button>
        </div>
    </div>
</template>

<style scoped>
.list {
    display: grid;
    /* grid-template-columns: auto auto; */
}
.item {
    margin: 5px;
}
</style>