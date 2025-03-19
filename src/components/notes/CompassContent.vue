<template>
    <div class="tileContent modeCompass">
        <canvas ref="myCanvas" class="tileContent"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { Formatter } from '../../lib/Formatter';
import { loadPartialConfig } from '@babel/core';

const props = defineProps({
    heading: {type: Boolean, Default: true}
})

const myCanvas = ref()
const headings = ref(true)

onMounted( () => {
    loadProps(props)
})

watch( () => props.heading, (newHeading) => {
    console.log('[CompassContent.watch] heading', newHeading)
    loadProps(props)
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

    ctx.translate(centerX, centerY)
    // middle crosshair
    if(headings.value) { // horizontal line only in headings mode
        ctx.beginPath();
        ctx.strokeStyle = 'lightgrey';
        ctx.setLineDash([5, 2])
        ctx.lineWidth = 1;
        ctx.moveTo(-centerX + padding, 0)
        ctx.lineTo(centerX - padding, 0)
        ctx.moveTo(0, -centerY + padding)
        ctx.lineTo(0, centerY - padding)
        ctx.stroke();
    }

    // draw tick mark every 10 degrees
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'darkgrey';
    ctx.setLineDash([])
    let lineLength = 10
    let drawTopText = false
    let drawBottomText = false
    const rotation = 10 * degToRad
    ctx.rotate(-90*degToRad)
    if(headings.value) {
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
    } else {
        for (let i = 90; i < 270; i += 10) {
            if(i == 180) {
                ctx.font = "16px Verdana"
                ctx.fillStyle = "lightgrey"
                ctx.fillText( 'HDG', 0, -centerY + padding + lineHeight);
                ctx.fillStyle = "darkgrey"
                ctx.font = "20px Verdana"
                ctx.fillText( 'Direct', 0, centerY / 2 - lineHeight);
                ctx.font = "10px Verdana"
                ctx.fillStyle = "black"
                ctx.fillText( '1) HDG 2) Outbound CRS 3) Turns', 0, centerY - lineHeight / 2);
            } else if( i == 110) {
                ctx.font = "16px Verdana"
                ctx.fillStyle = "lightgrey"
                ctx.fillText( 'LT', 0, -centerY + padding + lineHeight);
            } else if( i == 250) {
                ctx.font = "16px Verdana"
                ctx.fillStyle = "lightgrey"
                ctx.fillText( 'RT', 0, -centerY + padding + lineHeight);
            }
            if( i == 180 || i == 110 || i == 250) {
                ctx.beginPath();
                ctx.strokeStyle = 'lightgrey';
                ctx.setLineDash([5, 2])
                ctx.lineWidth = 1;
                ctx.moveTo(0, -centerY + padding + lineHeight)
                ctx.lineTo(0, centerY - padding - lineHeight)
                ctx.stroke();
                ctx.setLineDash([])
                ctx.strokeStyle = 'darkgrey';

                ctx.lineWidth = 3;
                lineLength = 20
            } else if( i % 30 == 0) {
                ctx.lineWidth = 2;
                lineLength = 10
            } else {
                ctx.lineWidth = 1;
                lineLength = 5
            }

            // Top
            ctx.beginPath();
            let posY = -centerY + padding + lineHeight * 1.5
            ctx.moveTo(0, posY)
            ctx.lineTo(0, posY + lineLength)
            // Bottom
            posY = centerY - padding - lineLength - lineHeight * 1.5
            ctx.moveTo(0, posY)
            ctx.lineTo(0, posY + lineLength)
            ctx.stroke();

            ctx.rotate(rotation)
        }
    }
}

function loadProps(props) {
    headings.value = props.heading
    draw()
}
</script>

