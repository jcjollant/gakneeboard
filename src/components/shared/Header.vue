<template>
    <div class="headerTitle" :class="{ clickable: clickable, left: left}">
        <div class="titleText" :class="{ stealth: stealth}">{{ title }}</div>
        <Button v-if="replace" class="replaceButton" :class="{'hidden':hideReplace}" icon="pi pi-eject" 
            :title="'Replace ' + (page ? 'Page' : 'Tile')" link
            @click.stop="emits('replace')"></Button>
    </div>
</template>

<script setup>
import { onMounted,ref, watch } from 'vue';
import Button from 'primevue/button'

const emits = defineEmits(['replace'])

const props = defineProps({
    clickable: { type: Boolean, default:true},
    left: { type: Boolean, default:false},
    replace: { type:Boolean, default:true},
    hideReplace: { type:Boolean, default:true},
    stealth: { type: Boolean, default:false},
    title: { type: String, required:true},
    page: { type: Boolean, default:false},
})

const title=ref('');
const clickable=ref(false)
const replace=ref(false)
const hideReplace=ref(true)
const left = ref(false)
const stealth = ref(false)

onMounted( () => {
    updateProps(props)
})

function updateProps(props) {
    // console.log('Heeader update props ' + JSON.stringify(props))
    title.value = props.title
    replace.value = props.replace
    hideReplace.value = props.hideReplace
    left.value = props.left
    clickable.value = props.clickable
    stealth.value = props.stealth
}

watch( props, async() => {
    updateProps(props)
})

</script>

<style scoped>
.headerTitle {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 15px;
    border-bottom: 1px dashed darkgrey;
    position: relative;
    height: 23px;
    line-height: 23px;
}
.clickable:hover .replaceButton {
    display: inline-flex;
}
.clickable:hover {
    color: darkblue;
    font-weight: bolder;
    opacity: 1;
}
.replaceButton {
    position:absolute;
    font-size: 13px;
    right: 1px;
    top:1px;
    width: 21px;
    height: 21px;
    /* padding: 5px; */
    margin: 0;
    /* background-color: darkred; */
    /* color: green; */
    border: 0
}
.replaceButton:hover {
    background-color: darkblue;
    color:white;
}
.left {
    justify-content: flex-start;
    padding-left: 20px;
}
.stealth {
    opacity: 0.3;
}
.stealth:hover {
    opacity: 1;
}

.titleText {
    height: 25px;
    overflow: hidden;
}
</style>