<template>
    <div class="tile">
        <Header :title="title"></Header>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Header from '../shared/Header.vue';

// Props management
const props = defineProps({
    params: { type: Object, default: null},
})

const title = ref('Dummy')

function loadProps(props:any) {
    if(props?.params?.header) title.value = props.params.header
}

onMounted(() => {   
    loadProps(props)
})
</script>

