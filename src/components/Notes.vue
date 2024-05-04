<script setup>
import { ref } from 'vue'
import Header from './Header.vue';
import NoSettings from './NoSettings.vue';

const emits = defineEmits(['replace'])

const mode = ref('')

function onClick() {
    mode.value = (mode.value == '' ? 'edit' : '')
}

</script>
<template>
    <div class="widget">
        <Header :title="'Notes'" :replace="mode=='edit'" :stealth="mode==''"
            @click="onClick" @replace="emits('replace')"></Header>
        <NoSettings v-if="mode=='edit'"></NoSettings> 
    </div>
</template>
