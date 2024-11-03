<template>
    <div class="verticalBar">
        <Button id="editorCopyToRight" v-if="!edge"
            icon="pi pi-arrow-right" title="Copy Left to Right" 
            @click="onAction(EditorAction.copyToPage(offset, offset+1))" ></Button>
        <Button id="editorSwap" v-if="!edge"
            icon="pi pi-arrow-right-arrow-left" title="Swap Left and Right" 
            @click="onAction(EditorAction.swapPage(offset,offset+1))" ></Button>
        <Button id="editorCopyToLeft" v-if="!edge"
            icon="pi pi-arrow-left" title="Copy Right to Left" 
            @click="onAction(EditorAction.copyToPage(offset+1, offset))" ></Button>
        <Button id="editorInsert" icon="pi pi-plus" :title="last?'Add One Page':'Insert New Page Here'" 
            @click="onAction(EditorAction.insertPage(offset+1))" ></Button>
        <FAButton icon="video" v-if="offset==-1"
            title="Editor Demo Video" :link="true"
            @click="UserUrl.open(UserUrl.editorVideo)"/>
    </div>
</template>

<script setup lang="ts">
import { EditorAction } from '../../assets/EditorAction';
import { UserUrl } from '../../lib/UserUrl';

import Button from 'primevue/button';
import FAButton from '../shared/FAButton.vue';
import { onMounted, ref, watch } from 'vue';

const emits = defineEmits(['action'])
const props = defineProps({
    last: {type: Boolean, default: false},
  offset: {type: Number, default: 0},
})
const edge = ref(false)
const last = ref(false)
const offset = ref(0)

function onAction( action:EditorAction) {
    // console.log('[VerticalActionBar.onAction]', JSON.stringify(action))
    emits('action', action)
}

function loadProps(props:any) {
    edge.value = props.last || props.offset == -1;
    last.value = props.last;
    offset.value = props.offset;
}

onMounted( () => {
    loadProps(props)
})

watch( props, async() => {
  loadProps( props)
})



</script>

<style scoped>
.verticalBar {
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  width: var(--pages-gap);
  height: var(--page-height);
}
</style>