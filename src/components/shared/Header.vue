<script setup>
import { onMounted,ref, watch } from 'vue';
import Button from 'primevue/button'

const emits = defineEmits(['replace'])

const props = defineProps({
    clickable: { type: Boolean, default:true},
    left: { type: Boolean, default:false},
    page: { type: Boolean, default:false},
    replace: { type:Boolean, default:false},
    stealth: { type: Boolean, default:false},
    title: { type: String, required:true},
})

const title=ref('');
const clickable=ref(false)
const replace=ref(false)
const left = ref(false)
const page = ref(false)
const stealth = ref(false)

onMounted( () => {
    updateProps()
})

function updateProps() {
    // console.log('Heeader update props ' + JSON.stringify(props))
    title.value = props.title
    replace.value = props.replace
    left.value = props.left
    page.value = props.page
    clickable.value = props.clickable
    stealth.value = props.stealth
}

watch( props, async() => {
    updateProps()
})

</script>


<template>
    <div class="headerTitle" :class="{ clickable: clickable, left: left, page: page, stealth: stealth }">
        <div>{{ title }}</div>
        <Button class="replace" v-if="replace" icon="pi pi-trash" title="Replace Tile" @click="emits('replace')"></Button>
    </div>
</template>

<style scoped>
    .headerTitle {
        text-align: center;
        padding: 0 5px;
        border-bottom: 1px dashed darkgrey;
        position: relative;
        overflow: hidden;
        height: 25px;
        line-height: 25px;
    }
    .clickable:hover {
        color: darkblue;
        font-weight: bolder;
    }
    .page {
        font-size: 1.2rem;
        font-weight: bolder;
    }
    .replace {
        position:absolute;
        font-size: 15px;
        right: 3px;
        top:5px;
        width: 28px;
        height: 28px;
        padding: 5px;
        margin: 0;
        background-color: darkred;
        color: white;
        border: 0
    }
    .left {
        text-align: left;
        padding-left: 20px;
    }
    .stealth {
        opacity: 0.3;
    }

</style>