<!-- This component allows the user to pick a widget -->
<script setup>
import {ref} from 'vue';
import Airport from './Airport.vue';

const items = ref(['Airport','ATIS','List','Notes'])
const emits = defineEmits(['loadWidget'])
const widget = ref('')

function loadWidget(name) {
    // console.log('load widget ' + name)
    // emits('loadWidget', name)
    widget.value = name;
}

</script>

<template>
    <div v-if="widget==''" class="widget">
        <div class="widgetTitle">Widget Selection</div>
        <div class="content list">
            <button v-for="item in items" class="item" @click="loadWidget(item)">{{ item }}</button>
        </div>
    </div>
    <div v-if="widget=='Airport'">
        <Airport></Airport>
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