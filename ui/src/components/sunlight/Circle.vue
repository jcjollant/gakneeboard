<script setup>
import { ref, onMounted, watch } from 'vue'
const circleCanvas = ref()

const props = defineProps({
    time: { type: Number, default: null},
    night: { type: Boolean, default: false},
})

let night = false;

function loadProps(newProps) {
    // console.log('[Circle.loadProps]', JSON.stringify(newProps))
    if( newProps) night = newProps.night;
    draw()
}

onMounted(() => {    
    loadProps(props)
})

watch( props, async() => {
    loadProps(props)
})

function draw() {
    // console.log('[Circle.draw]', circleCanvas)
    if( !circleCanvas || !circleCanvas.value) return;
    // console.log('[Circle.draw] getContext')
    const ctx = circleCanvas.value.getContext('2d');
    const referenceSize = 240;
    circleCanvas.value.width = referenceSize;
    circleCanvas.value.height = referenceSize;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    const center = referenceSize / 2
    const radius = center - 15
    const twilightColor = 'blue'
    const dayColor = '#46B1E1'
    const nightColor = 'black'

    // Bottom Portion
    ctx.strokeStyle = night ? dayColor : twilightColor;
    ctx.beginPath();
    ctx.arc( center, center, radius, 0, Math.PI/4, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc( center, center, radius, 3 * Math.PI / 4, Math.PI, false);
    ctx.stroke();

    // Top portion
    ctx.beginPath();
    ctx.lineCap = 'butt'
    if( night) {
        // Civil twilight evening
        ctx.strokeStyle = twilightColor;
        ctx.beginPath();
        ctx.arc( center, center, radius, Math.PI, 5 * Math.PI / 4, false);
        ctx.stroke();
        // Night
        ctx.strokeStyle = nightColor;
        ctx.beginPath();
        ctx.arc( center, center, radius, 5 * Math.PI / 4, 7 * Math.PI / 4, false);
        ctx.stroke();
        // Civil twilight morning
        ctx.strokeStyle = twilightColor;
        ctx.beginPath();
        ctx.arc( center, center, radius, 7 * Math.PI / 4, 0, false);
        ctx.stroke();
    } else {
        ctx.strokeStyle = dayColor;
        ctx.arc( center, center, radius, 0, Math.PI, true);
    }
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