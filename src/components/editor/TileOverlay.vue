<template>
    <div v-if="show" class="tileOverlay">
        <Button class="btn1" icon="pi  pi-arrows-h" @click="swap(1,2)"></Button>
        <Button class="btn2" icon="pi  pi-arrows-v" @click="swap(1,3)"></Button>
        <Button class="btn3" icon="pi  pi-arrows-v" @click="swap(2,4)"></Button>
        <Button class="btn4" icon="pi  pi-arrows-h" @click="swap(3,4)"></Button>
        <Button class="btn5" icon="pi  pi-arrows-v" @click="swap(3,5)"></Button>
        <Button class="btn6" icon="pi  pi-arrows-v" @click="swap(4,6)"></Button>
        <Button class="btn7" icon="pi  pi-arrows-h" @click="swap(5,6)"></Button>
    </div>
    <div v-else class="tileOverlay"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button'
const emits = defineEmits(['swap'])
const show = ref(true)
//---------------------
// Props management
const props = defineProps({
  show: { type: Boolean, default: true},
})

function loadProps( props:any) {
  show.value = props.show;
}

onMounted( () => {
  loadProps(props)
})  

watch( props, async() => {
  loadProps( props)
})

// End props management
//---------------------

function swap(from:number, to:number) {
    // emits the message and adjust tile index
    emits('swap', {from:(from-1), to:(to-1)})
}
</script>

<style scoped>
* {
    --left-offset1: calc( var(--tile-width) - var(--editor-btn-half) + 2px);
    --left-offset2: calc(var(--tile-width) / 2);
    --left-offset3: calc(var(--tile-width) * 1.5 - var(--editor-btn-half));
    --top-offset1:  calc(var(--tile-height) / 2 - var(--editor-btn-half));
    --top-offset2:  calc(var(--tile-height) - var(--editor-btn-half));
    --top-offset3:  calc(var(--tile-height) * 1.5 - var(--editor-btn-half));
    --top-offset4:  calc(var(--tile-height) * 2 - var(--editor-btn-half));
    --top-offset5:  calc(var(--tile-height) * 2.5 - var(--editor-btn-half));
}
.tileOverlay {
    position: relative;
    width: var(--page-width);
    height: var(--page-height);
}
.tileOverlay .p-button {
    position: absolute;
    z-index: 2;
    box-shadow: rgba(0, 0, 0, 0.8) 0px 8px 8px;
}
.btn1 {
    left: var(--left-offset1);
    top: var(--top-offset1);
}
.btn2 {
    left: var(--left-offset2);
    top: var(--top-offset2);
}
.btn3 {
    left: var(--left-offset3);
    top: var(--top-offset2);
}
.btn4 {
    left: var(--left-offset1);
    top: var(--top-offset3);
}
.btn5 {
    left: var(--left-offset2);
    top: var(--top-offset4);
}
.btn6 {
    left: var(--left-offset3);
    top: var(--top-offset4);
}
.btn7 {
    left: var(--left-offset1);
    top: var(--top-offset5);
}

</style>