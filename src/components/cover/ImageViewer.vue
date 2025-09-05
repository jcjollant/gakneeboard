<template>
    <div class="imageViewer">
        <img v-if="imageUrl" :src="imageUrl" class="coverImage"/>
        <i v-else class='pi pi-camera imageHolder'></i>
    </div>
</template> 

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
    url: String
})
const imageUrl = ref('')

onMounted(() => {
    imageUrl.value = props.url || ''
})

watch(() => props.url, (newVal) => {
    imageUrl.value = newVal || ''
})

</script>
<style scoped>
.imageViewer {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
    flex: 1;
}
.coverImage {
    height: 100%;
}
</style>