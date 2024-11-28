<template>
    <div v-if="tiles" class="overlay" :class="{blue: blue}">
        <div class="rowMiddle flexColumn">
            <div v-for="pair in [1,3,5]">
                <div class="copyPaste">
                    <Button :class="'btnCopy' + pair" icon="pi pi-copy" @click="copy(pair)" :title="'Copy Tile ' + pair + ' to Clipboard'"></Button>
                    <Button :class="'btnPaste' + pair" icon="pi pi-clipboard" @click="paste(pair)" :title="'Paste to Tile ' + pair + ' from Clipboard'"></Button>
                </div>
                <Button :class="'btnSwap' + pair + '' + (pair+1)" icon="pi  pi-arrows-h" @click="swap(pair,pair+1)" :title="'Swap Tiles ' + pair + ' and ' + (pair+1)"></Button>
                <div class="copyPaste">
                    <Button :class="'btnCopy' + (pair+1)" icon="pi pi-copy" @click="copy(pair+1)" :title="'Copy Tile ' + (pair+1) + ' to Clipboard'"></Button>
                    <Button :class="'btnPaste' + (pair+1)" icon="pi pi-clipboard" @click="paste(pair+1)" :title="'Paste to Tile ' + (pair+1) + ' from Clipboard'"></Button>
                </div>
            </div>
        </div>
        <div class="rowSeparator flexColumn">
            <div>
                <Button class="btnSwap13" icon="pi  pi-arrows-v" @click="swap(1,3)" title="Swap Tiles 1 and 3"></Button>
                <Button class="btnSwap24" icon="pi  pi-arrows-v" @click="swap(2,4)" title="Swap Tiles 2 and 4"></Button>
            </div>
            <div>
                <Button class="btn5" icon="pi  pi-arrows-v" @click="swap(3,5)" title="Swap Tiles 3 and 5"></Button>
                <Button class="btn6" icon="pi  pi-arrows-v" @click="swap(4,6)" title="Swap Tiles 4 and 6"></Button>
            </div>
        </div>
    </div>
    <div v-else class="overlay" :class="{blue: blue}"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Button from 'primevue/button'
import { PageType } from '../../assets/Templates';

const blue = ref(false)
const emits = defineEmits(['copy','paste','swap'])
const tiles = ref(false)
const offset = ref(0)
//---------------------
// Props management
const props = defineProps({
  type: { type: String, default: null},
  offset: { type: Number, default: 0},
})

function loadProps( props:any) {
    blue.value = (props.type != PageType.selection);
    tiles.value = props.type == PageType.tiles;
    offset.value = props.offset;
}

onMounted( () => {
  loadProps(props)
})  

watch( props, async() => {
  loadProps( props)
})

// End props management
//---------------------
function copy(tile:number) {
    // emits the message and adjust tile index
    emits('copy', {offset:offset.value, tile:(tile-1)})
}
function paste(tile:number) {
    // emits the message and adjust tile index
    emits('paste', {offset:offset.value, tile:(tile-1)})
}
function swap(from:number, to:number) {
    // emits the message and adjust tile index
    emits('swap', {offset:offset.value,from:(from-1), to:(to-1)})
}
</script>

<style scoped>
* {
    --button-height: 38px;
    --half-button: 19px;
}
.copyPaste {
    display: flex;
    flex-flow: column;
    gap: 5px;
}

.flexColumn {
    display: flex;
    flex-flow: column;
    justify-content: space-around;
    align-items: center;
    height: 100%;
}
.overlay {
    position: relative;
    width: var(--page-width);
    height: calc( var(--page-height) - 4px);
}
.overlay.blue {
    background-color: rgba(33, 150, 243, 0.3);
    z-index: 1;
}
.overlay .p-button {
    height: var(--button-height);
    z-index: 2;
    box-shadow: rgba(0, 0, 0, 0.8) 0px 8px 8px;
}

.rowMiddle > div {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    padding: 0 5px;
}

.rowSeparator {
    padding: 19px 0;
    position: absolute;
    left: 0;
    top: 0;
    justify-content: space-evenly;
    width:100%;
}
.rowSeparator > div {
    display: flex;
    flex-flow: row;
    justify-content: space-around;
    width: 100%;
}
</style>