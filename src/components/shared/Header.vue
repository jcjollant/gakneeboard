<template>
    <div class="headerTitle" :class="{ clickable: clickable, left: left, stealth:stealth}">
        <div class="titleText" @click="emits('title')">{{ title }}</div>
        <div v-if="leftButton=='display'" :title="`Change ${type} Mode`" class="displayButton headerButton" 
            @click="emits('display')">
            <font-awesome-icon :icon="['fas','fa-display']" />
        </div>
        <div v-else-if="leftButton=='settings'" 
            :title="`Change ${type} Settings`" 
            class="displayButton headerButton" 
            @click="emits('settings')">
            <font-awesome-icon :icon="['fas','fa-gear']" />
        </div>
        <div v-if="replace" :title="`Replace ${type}`" class="replaceButton headerButton" 
            @click.stop="emits('replace')">
            <font-awesome-icon :icon="['fas','fa-eject']" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted,ref, watch } from 'vue';

const emits = defineEmits(['display','replace','title','settings'])

const props = defineProps({
    clickable: { type: Boolean, default:true},
    left: { type: Boolean, default:false},
    leftButton : { type: String, default:'display'},
    replace: { type:Boolean, default:true},
    showReplace: { type:Boolean, default:false},
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

const type = computed(() => props.page ? 'Page' : 'Tile')

onMounted( () => {
    updateProps(props)
})

function updateProps(props:any) {
    // console.log('Heeader update props ' + JSON.stringify(props))
    title.value = props.title
    replace.value = props.replace
    hideReplace.value = !props.showReplace
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
.headerTitle.stealth {
    border-bottom: 1px dashed white;
}
.clickable:hover .headerButton {
    display: inline-flex;
}
.clickable:hover {
    color: darkblue;
    font-weight: bolder;
    opacity: 1;
}
.headerButton {
    display: none;
    color: var(--bg);
    margin: 0;
    border: 0;
    top:1px;
    padding: 4px;
    border-radius: 2px;
    font-size: 12px;
    border-radius: 2px;
    position:absolute;
    background-color: white;
}
.headerButton:hover {
    background-color: darkblue;
    color:white;
}
.displayButton {
    left: 1px;
}
.replaceButton {
    right: 1px;
}
.left {
    justify-content: flex-start;
    padding-left: 26px;
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