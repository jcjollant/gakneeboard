<script setup>

import {ref, onMounted} from 'vue';

const props = defineProps({
    runway: { type: Object, required: true}  
})

const airportName = ref()
const weatherFreq = ref()
const weatherType = ref()
const trafficFreq = ref()
const trafficType = ref()
const elevation = ref()
const tpa = ref()
const myCanvas = ref()

// add initialization code 
onMounted(() => {
    let runway = props.runway
    console.log(runway)
    airportName.value = runway.airportCode + ' : ' + runway.airportName
    weatherFreq.value = runway.weather.freq;
    weatherType.value = runway.weather.type
    trafficFreq.value = runway.traffic.freq;
    trafficType.value = runway.traffic.type;
    elevation.value = runway.elev;
    tpa.value = runway.tpa;

    const r1o = runway.rwy1.orientation;
        var northRwy, southRwy;
        if( r1o >= 90 && r1o <= 180 || r1o > 180 && r1o < 270) {
            northRwy = runway.rwy2;
            southRwy = runway.rwy1;
        } else {
            northRwy = runway.rwy1;
            southRwy = runway.rwy2;
        }

        // const canvas = document.getElementById('myCanvas');
        const ctx = myCanvas.value.getContext('2d');
        const canvasWidth = 400;
        const canvasHeight = 400;

        const length = 220;
        const width = 30;
        const angleInRad = Math.PI / 180 * northRwy.orientation; // Convert degrees to radians

        // Move center to origin
        ctx.translate((canvasWidth) / 2, (canvasHeight) / 2); // Move back to original position
        ctx.rotate(angleInRad);
        // draw runway
        ctx.fillStyle = 'black';
        ctx.fillRect( -width / 2, -length / 2, width, length);
        // draw runway names
        ctx.font = "20px Verdana"
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText( southRwy.name, 0, -length/2 + 20)
        ctx.fillText( northRwy.name, 0, length/2 - 5);
        
        // Traffic pattern
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'grey';
        const tpDownwind = width * 2;
        const tpBase = length / 2 + width;
        
        // north runway
        ctx.beginPath();
        if(northRwy.pattern == 'right') {
            ctx.moveTo( tpDownwind, 0);
            ctx.lineTo( tpDownwind, tpBase);
        } else {
            ctx.moveTo( -tpDownwind, 0);
            ctx.lineTo( -tpDownwind, tpBase);
        }
        ctx.lineTo( 0, tpBase);
        ctx.lineTo( 0, length / 2);
        ctx.stroke()
        
        // Runway 2
        ctx.beginPath();
        if(southRwy.pattern == 'right') {
            ctx.moveTo( -tpDownwind, 0);
            ctx.lineTo( -tpDownwind, -tpBase);
        } else {
            ctx.moveTo( tpDownwind, 0);
            ctx.lineTo( tpDownwind, -tpBase);
        }
        ctx.lineTo( 0, -tpBase);
        ctx.lineTo( 0, -length / 2);
        ctx.stroke();
})

</script>


<template>
    <h1>{{airportName}}</h1>
    <div class="container">
        <div class="corner top left"><div>{{weatherFreq}}</div><div class="label">{{weatherType}}</div></div>
        <div class="corner top right"><div>{{trafficFreq}}</div><div class='label'>{{trafficType}}</div></div>
        <div class="corner bottom left"><div class='label'>Elev</div><div>{{ elevation }}</div></div>
        <div class="corner bottom right"><div class='label'>TPA</div><div>{{ tpa }}</div></div>
        <div>
            <canvas ref="myCanvas"></canvas>
        </div>
    </div>
    
</template>
<style scoped>
    h1 {
        font-size: 24px;
        text-align: left;
    }
    .container {
        width: 400px; /* Adjust width as needed */
        height: 400px; /* Adjust height as needed */
        border: 1px solid darkgrey;
        position: relative; /* Needed for absolute positioning */
    }
    .corner {
        position: absolute; /* Absolute positioning within container */
        padding: 10px; /* Adjust padding for better visibility */
        font-size: 36px; /* Adjust font size as desired */
        font-family: Verdana, sans-serif;
    }
    .corner .label {
        padding: 0;
        font-size:18px;
    }
    .top {
        top: 0;
    }
    .bottom {
        bottom: 0;
    }
    .left{
        left: 0;
        text-align: left;
    }
    .right {
        right: 0;
        text-align: right; /* Align text to the right */
    }
    </style>