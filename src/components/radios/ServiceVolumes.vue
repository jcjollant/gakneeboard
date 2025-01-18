<template>
    <div class="vorrange">
        <img :src="type.img" class="serviceVolume" />
        <OneChoice v-model="type" :choices="volumeList" :thinpad="true" class="volumeChoice" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import OneChoice from '../shared/OneChoice.vue';
import { ServiceVolume } from '@/model/ServiceVolume';

const emits = defineEmits(['volume'])
const model = defineModel()
const volumeList = [
    {label:'(T)',value:ServiceVolume.Terminal,img:'/tiles/vorsv-terminal.png', title:'Terminal'},
    {label:'(L)',value:ServiceVolume.Low,img:'/tiles/vorsv-low.png', title:'Low'},
    {label:'(H)',value:ServiceVolume.High,img:'/tiles/vorsv-high.png', title:'High'},
    {label:'(VL)',value:ServiceVolume.VORLow,img:'/tiles/vorsv-vl.png', title:'VOR Low'},
    {label:'(VH)',value:ServiceVolume.VORHigh,img:'/tiles/vorsv-vh.png', title:'VOR High'},
]
const type = ref(volumeList[0])

onMounted(() => {
    loadModel()
})

watch( model, () => {
    loadModel()
})

watch( type, () => {
    model.value = type.value.value
})

function loadModel() {
    // console.log('[ServiceVolumes.watch]', model)
    const vol = volumeList.find((v:any) => v.value === model.value)
    if (vol) {
        type.value = vol
    }
}

</script>

<style scoped>
.serviceVolume {
    width: var(--tile-width);
    object-fit: contain;
}
.vorrange {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>