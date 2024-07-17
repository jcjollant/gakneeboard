<script setup>
import { ref, onMounted, watch } from 'vue'
const circleCanvas = ref()

const props = defineProps({
    time: { type: Number, default: null},
})

onMounted(() => {    
    draw()
})

watch( props, async() => {
    // console.log("RunwayView props changed " + JSON.stringify(props));
    draw()
})

function draw() {
    // console.log('[Circle.draw]', circleCanvas)
    if( !circleCanvas || !circleCanvas.value) return;
    // console.log('[Circle.draw] getContext')
    const ctx = circleCanvas.value.getContext('2d');
    const referenceSize = 200;
    circleCanvas.value.width = referenceSize;
    circleCanvas.value.height = referenceSize;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    const center = referenceSize / 2
    const radius = center - 15

    // Evening Twilight
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.arc( center, center, radius, 0, Math.PI/4, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc( center, center, radius, 3 * Math.PI / 4, Math.PI, false);
    ctx.stroke();

    // Sun Light
    ctx.beginPath()
    ctx.lineCap = 'butt'
    ctx.strokeStyle = 'yellow'
    ctx.arc( center, center, radius, 0, Math.PI, true);
    ctx.stroke();

    // horizon
    ctx.beginPath()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'lightgrey'
    ctx.setLineDash([5,5])
    ctx.moveTo(0, center)
    ctx.lineTo(referenceSize, center)

    ctx.stroke();
}


</script>

<template>
    <canvas ref="circleCanvas"></canvas>
</template>