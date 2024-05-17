<script setup>
import { onMounted, ref } from 'vue';

onMounted(() => {    
    // loadProps(props)
    draw()
})

const myCanvas = ref()


function draw() {
    const ctx = myCanvas.value.getContext('2d');
    const height = 200;
    const barWidth = 20;
    const width = 60
    myCanvas.value.width = width;
    myCanvas.value.height = height;

    const gph = 9
    const usable = 53
    const reserveHrs = 1
    ctx.beginPath()
    ctx.strokeStyle = '#666666'
    ctx.fillStyle = ctx.strokeStyle
    ctx.lineWidth = 1;
    const leftSide = (width - barWidth) / 2
    const rightSide = (width + barWidth) / 2
    ctx.moveTo( leftSide, 0)
    ctx.lineTo( leftSide, height)
    ctx.moveTo( rightSide, 0)
    ctx.lineTo( rightSide, height)
    ctx.stroke()

    // gal tick marks
    ctx.beginPath()
    ctx.lineWidth = 0.5;
    for( let gal = 10; gal < usable; gal += 10) {
        const pos = height * ( 1 - gal / usable)
        const tickMarkSize = 5
        ctx.moveTo(leftSide, pos)
        ctx.lineTo(leftSide - tickMarkSize, pos)
        ctx.fillText( gal, leftSide - tickMarkSize - 15, pos + 3)
    }
    // Hrs tick marks
    const maxTime = usable / gph
    // console.log('FuelGauge maxTime ' + maxTime)
    for( let hour = 1; hour < maxTime; hour++) {
        const pos = height * (1 - hour / maxTime)
        const tickMarkSize = 5
        ctx.moveTo(rightSide, pos)
        ctx.lineTo(rightSide + tickMarkSize, pos)
        ctx.fillText( hour, rightSide + tickMarkSize + 2, pos + 3)
    }
    ctx.stroke()

    // reserve fuel
    const reserveGal = gph * reserveHrs
    const reserveHeight = reserveGal * height / usable 
    ctx.fillStyle = '#FFAAAA'
    ctx.fillRect( (width - barWidth) / 2, height - reserveHeight, barWidth, reserveHeight);

}
</script>

<template>
    <div class="container">
        <canvas ref="myCanvas"></canvas>
        <div class="label"><span>Gal</span><span>Hrs</span></div>
    </div>
</template>

<style scoped>
.container {
    position: relative;
}
.label {
    display: flex;
    justify-content: space-around;
    font-size: 10px;
    position: absolute;
    bottom: 2px;
    width: 100%;
}
</style>