<script setup>
import { onMounted, ref, watch } from 'vue'
// import { demoPageChecklist } from '../assets/data'

import Header from '../components/shared/Header.vue'
import NoSettings from '../components/shared/NoSettings.vue'

const props = defineProps({
    data: { type: Object, default: null},
})

function loadProps(newProps) {
    console.log('[ChecklistPage.loadProps]', JSON.stringify(newProps))
    if( newProps.data && newProps.data.name) {
        data.value = newProps.data;
    } else {
        data.value = null
    }
}

onMounted(() => {
    loadProps(props)
})

watch( props, () => {
    loadProps(props)
})



const data = ref(null)

</script>

<template>
    <div v-if="data" class="contentPage">
        <Header :title="data.name" class="heading"></Header>
        <div v-for="(item,index) in data.items" class="checklist" :class="{'even':index % 2}">
            <div v-if="item.c.length > 0 && item.c[0]=='#'" class="separator">{{ item.c.substring(1) }}</div>
            <div v-else class="challenge" >{{item.c}}</div><div class="response">{{item.r}}</div>
        </div>
    </div>
    <div v-else class="contentPage">
        <Header title="Checklist"></Header>
        <NoSettings></NoSettings>
    </div>

</template>

<style scoped>
.contentPage {
        overflow: hidden;

}
.checklist {
    display: grid;
    grid-template-columns: 70% 30%;
    line-height: 1.6rem;
    border-bottom: 1px solid lightgrey;
}
.challenge {
    text-align: left;
    padding-left: 10px;
    border-right: 1px solid lightgrey;
}
/* @media print {
.even {
    background-color: lightyellow !important;
    print-color-adjust: exact;
}
  
}*/
.even {
    background: lightyellow;
}
.response {
    font-weight: bold;
}
.separator {
    font-weight: bolder;
    color: darkgrey;
    background: white;
    grid-column: 1 / span 2;

}

.heading {
    font-weight: bolder;
    font-size: 1.2rem;
}
</style>