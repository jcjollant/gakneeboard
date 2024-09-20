<script setup>
import { ref } from 'vue'
import Header from '../shared/Header.vue';
import NoSettings from '../shared/NoSettings.vue';

const emits = defineEmits(['replace'])

const mode = ref('')

function onClick() {
    mode.value = (mode.value == '' ? 'edit' : '')
}

</script>
<template>
    <div class="tile">
        <Header :title="'Notes'" :stealth="mode==''" :hideReplace="mode!='edit'"
            @click="onClick" @replace="emits('replace')"></Header>
        <NoSettings v-if="mode=='edit'"></NoSettings> 
    </div>
</template>
