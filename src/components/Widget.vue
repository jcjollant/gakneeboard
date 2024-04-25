<!-- This component allows the user to pick a widget -->
<script setup>
import {onMounted, ref} from 'vue';
import Airport from './Airport.vue';
import Atis from './Atis.vue'

const props = defineProps({
    name: { type: String, default: ''},
    data: { type: Object, default: null}
})

const items = ref(['airport','atis','List','Notes'])
const emits = defineEmits(['loadWidget'])

function loadWidget(name) {
    // console.log('load widget ' + name)
    // emits('loadWidget', name)
    widget.value = name;
}

// onMounted(() => (
//     // console.log('Widget mounted')
// ))

</script>

<template>
    <div v-if="name==''" class="widget">
        <div class="widgetTitle">Widget Selection</div>
        <div class="content list">
            <button v-for="item in items" class="item" @click="loadWidget(item)">{{ item }}</button>
        </div>
    </div>
    <Airport v-else-if="name=='airport'" :params="data" />
    <Atis v-else-if="name=='atis'"/>
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