<template>
        <Image v-if="imageUrl" :src="imageUrl" width="400" class="coverImage"/>
        <i v-else class='pi pi-camera imageHolder'></i>
</template> 

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import Image from 'primevue/image'

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
</style>