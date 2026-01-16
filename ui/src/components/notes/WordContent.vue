<template>
    <div  class="tileContent modeWord" :class="{medium: letters.length > 6, small: letters.length > 9}">
        <div v-for="(letter,index) in letters" class="letterWatermark" :class="['letter'+index]"
            @click="emits('letterclick')">{{ letter }}</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const emits = defineEmits(['letterclick'])
const props = defineProps({
    word: {type: String, default: 'CRAFT'},
})
const letters = ref([])

onMounted(() => {
    loadProps(props)
})

watch( props, async() => {
    // console.log("Airport props changed " + JSON.stringify(props));
    loadProps(props)
})


function loadProps(props: any) {
    letters.value = props.word.split('')
}

</script>


<style scoped>
.modeWord {
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    /* line-height: 3rem; */
    font-weight:600;
    font-size: 30px;
    opacity: 0.2;
    text-align: left;
    padding: 6px 5px;
}
.modeWord.medium {
    font-size: 20px;
    opacity: 0.3;
}
.modeWord.small {
    font-size: 15px;
    opacity: 0.4;
}
.letterWatermark {
    cursor: pointer;
}
</style>