<template>
    <div>
        <img :src="source" class="imageContent" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const source = ref('')

const props = defineProps({
    src: { type: String, default: ''},
})

onMounted(() => {
    loadProps(props)
})

watch( props, () => {
    loadProps(props)
})


function loadProps(props:any) {
    source.value = '/tiles/' + props.src
}

</script>

<style scoped>
.imageContent {
    width: var(--tile-width);
    object-fit: contain;
}
</style>