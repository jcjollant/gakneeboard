<script setup>
import { onMounted,ref, watch } from 'vue';
import Button from 'primevue/button'

const emits = defineEmits(['replace'])

const props = defineProps({
    title: { type: String, required:true},
    replace: { type:Boolean, default:false},
    clickable: { type: Boolean, default:true},
    left: { type: Boolean, default:false},
    stealth: { type: Boolean, default:false},
})

const title=ref('');
const clickable=ref(false)
const replace=ref(false)
const left = ref(false)
const stealth = ref(false)

onMounted( () => {
    updateProps()
})

function updateProps() {
    // console.log('Heeader update props ' + JSON.stringify(props))
    title.value = props.title
    replace.value = props.replace
    left.value = props.left
    clickable.value = props.clickable
    stealth.value = props.stealth
}

watch( props, async() => {
    updateProps()
})

</script>


<template>
    <div class="header" :class="{ clickable: clickable, left: left, stealth: stealth }">
        <div>{{ title }}</div>
        <Button class="replace" v-if="replace" icon="pi pi-trash" title="Replace Tile" @click="emits('replace')"></Button>
    </div>
</template>

<style scoped>
    .header {
        text-align: center;
        padding: 5px;
        border-bottom: 1px dashed darkgrey;
        position: relative;
        overflow: hidden;
        /* height: 36px; */
        line-height: 26px;
    }
    .replace {
        position:absolute;
        font-size: 15px;
        right: 3px;
        top:3px;
        width: 28px;
        height: 28px;
        padding: 5px;
        margin: 0;
        background-color: darkred;
        color: white;
    }
    .left {
        text-align: left;
        padding-left: 20px;
    }
    .stealth {
        opacity: 0.3;
    }

</style>