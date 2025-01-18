<template>
    <div class="tileContent">
        <canvas ref="myCanvas" class="tileContent"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Formatter } from '@/lib/Formatter';

const myCanvas = ref()

onMounted(() => {
    draw()
})

function draw() {
    const canvas = myCanvas.value
    const ctx = canvas.getContext('2d')

    myCanvas.value.width = 240;
    myCanvas.value.height = 240;
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const padding = 5
    const lineHeight = 10
    const degToRad = Math.PI / 180
    // console.log('[CompassContent.draw]', centerX, centerY)

    // middle crosshair
    ctx.translate(centerX, centerY)
    ctx.beginPath();
    ctx.strokeStyle = 'lightgrey';
    ctx.setLineDash([5, 2])
    ctx.lineWidth = 1;
    ctx.moveTo(-centerX + padding, 0)
    ctx.lineTo(centerX - padding, 0)
    ctx.moveTo(0, -centerY + padding)
    ctx.lineTo(0, centerY - padding)
    ctx.stroke();

    // draw tick mark every 10 degrees
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'darkgrey';
    ctx.setLineDash([])
    let lineLength = 10
    let drawTopText = false
    let drawBottomText = false
    const rotation = 10 * degToRad
    ctx.rotate(-90*degToRad)
    for (let i = 90; i <= 270; i += 10) {
        ctx.beginPath();
        if( i % 90 == 0) {
            ctx.lineWidth = 3;
            ctx.font = "16px Verdana"
            lineLength = 20
            // we don't draw first text to draw it upward eventually
            drawTopText = true
            drawBottomText = (i != 90 && i != 270)
        } else if( i % 30 == 0) {
            ctx.lineWidth = 2;
            ctx.font = "12px Verdana"
            lineLength = 10
            drawTopText = true
            drawBottomText = true
        } else {
            ctx.lineWidth = 1;
            lineLength = 5
            drawTopText = false
            drawBottomText = false
        }

        // dont draw ticks for last angle which is only meant for text
        if( i < 270) {
            // Top
            let posY = -centerY + padding + lineHeight * 1.5
            ctx.moveTo(0, posY)
            ctx.lineTo(0, posY + lineLength)
            // Bottom
            posY = centerY - padding - lineLength - lineHeight * 1.5
            ctx.moveTo(0, posY)
            ctx.lineTo(0, posY + lineLength)
            ctx.stroke();
        }

        if(drawTopText) { 
            ctx.fillText( Formatter.compassHeading(i+180), 0, -centerY + padding + lineHeight);
        }
        if(drawBottomText) {
           ctx.fillText( i, 0, centerY - padding);
        }
        ctx.rotate(rotation)
    }
    // ctx.translate(centerX, centerY)
}
</script>

