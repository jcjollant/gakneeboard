<script setup>
import { onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'

const emits = defineEmits(['apply','cancel'])
const help = ref(null)
const canApply = ref(true)
const canCancel = ref(true)

//------------------------------
// Props management
const props = defineProps({
    help: { type: String, default: null },
    canApply : { type: Boolean, default: true},
    canCancel : { type: Boolean, default: true},
})

function loadProps(newProps) {
    help.value = newProps.help
    canApply.value = newProps.canApply
    canCancel.value = newProps.canCancel
}

onMounted(() => {
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

//------------------------------


function onHelp() {
    if(help.value) {
        window.open( help.value, '_blank');

    }
}

</script>
<template>
    <div class="actionBar">
        <Button class="floatLeft" v-if="help" icon="pi pi-info-circle" link @click="onHelp" title="Get help on this topic"></Button>
        <Button v-if="canCancel" @click="emits('cancel')" label="Cancel" link></Button>
        <Button icon="pi pi-check" @click="emits('apply')" label="Apply" :disabled="!canApply"></Button>
    </div>
</template>

<style scoped>
.floatLeft {
    position:absolute;
    left: 0;
    padding: 0;
    line-height: 1.5rem;
}
</style>