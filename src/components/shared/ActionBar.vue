<script setup>
import { onMounted, ref } from 'vue'
import Button from 'primevue/button'

const emits = defineEmits(['apply','cancel'])
const help = ref(null)

const props = defineProps({
    help: { type: String, default: null },
})

onMounted(() => {
    loadProps(props)
})

function loadProps(newProps) {
    help.value = newProps.help
}

function onHelp() {
    if(help.value) {
        window.open( help.value, '_blank');

    }
}

</script>
<template>
    <div class="actionBar">
        <Button class="floatLeft" v-if="help" icon="pi pi-info-circle" link @click="onHelp" title="Get help on this topic"></Button>
        <Button @click="emits('cancel')" label="Cancel" link></Button>
        <Button icon="pi pi-check" @click="emits('apply')" label="Apply"></Button>
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