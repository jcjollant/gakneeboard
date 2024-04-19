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
    // console.log(runway)
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
        const referenceSize = 200;
        myCanvas.value.width = referenceSize;
        myCanvas.value.height = referenceSize;

        const rwyLength = referenceSize * 0.55;
        const rwyHLength = rwyLength / 2;
        const rwyWidth = referenceSize * 0.1;
        const rwyHWidth = rwyWidth / 2;
        const tpDownwindDist = referenceSize * 0.15;
        const tpBaseDist = rwyLength / 2 + tpDownwindDist * 0.65;
        const tpLineWidth = referenceSize * 0.01;
        const tpArrowTip = referenceSize * 0.03;
        const rwyFontSize = Math.round( referenceSize / 20);

        const angleInRad = Math.PI / 180 * northRwy.orientation; // Convert degrees to radians

        // Move center to origin
        ctx.translate((referenceSize) / 2, (referenceSize) / 2); // Move back to original position
        ctx.rotate(angleInRad);
        // draw runway at the center
        ctx.fillStyle = 'black';
        ctx.fillRect( -rwyHWidth, -rwyHLength, rwyWidth, rwyLength);

        // draw runway names
        ctx.font = rwyFontSize + "px Verdana"
        // console.log(ctx.font);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText( southRwy.name, 0, -rwyHLength + rwyFontSize * 1.5)
        ctx.fillText( northRwy.name, 0, rwyHLength - rwyFontSize * 0.5);
        
        // Traffic pattern
        ctx.lineWidth = tpLineWidth;
        ctx.strokeStyle = 'grey';
        ctx.lineCap = 'round';
        
        // north runway 
        ctx.beginPath();
        // TP downwind
        if(northRwy.pattern == 'right') {
            ctx.moveTo( tpDownwindDist, 0);
            ctx.lineTo( tpDownwindDist, tpBaseDist);
        } else {
            ctx.moveTo( -tpDownwindDist, 0);
            ctx.lineTo( -tpDownwindDist, tpBaseDist);
        }
        // TP Base
        ctx.lineTo( 0, tpBaseDist);
        // TP final
        ctx.lineTo( 0, rwyHLength);
        // TP Tip
        ctx.moveTo( -tpArrowTip, rwyHLength + tpArrowTip);
        ctx.lineTo( 0, rwyHLength);
        ctx.lineTo( tpArrowTip, rwyHLength + tpArrowTip);
        ctx.stroke()
        
        // South Runway
        ctx.beginPath();
        // TP Downwind
        if(southRwy.pattern == 'right') {
            ctx.moveTo( -tpDownwindDist, 0);
            ctx.lineTo( -tpDownwindDist, -tpBaseDist);
        } else {
            ctx.moveTo( tpDownwindDist, 0);
            ctx.lineTo( tpDownwindDist, -tpBaseDist);
        }
        // TP Base
        ctx.lineTo( 0, -tpBaseDist);
        // TP Final
        ctx.lineTo( 0, -rwyHLength);
        // TP Tip
        ctx.moveTo( -tpArrowTip, -rwyHLength - tpArrowTip);
        ctx.lineTo( 0, -rwyHLength);
        ctx.lineTo( +tpArrowTip, -rwyHLength - tpArrowTip);
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
        font-size: 12px;
        text-align: left;
    }
    .container {
        width: 200px; /* Adjust width as needed */
        height: 200px; /* Adjust height as needed */
        border: 1px solid darkgrey;
        position: relative; /* Needed for absolute positioning */
    }
    .corner {
        position: absolute; /* Absolute positioning within container */
        padding: 5px; /* Adjust padding for better visibility */
        font-size: 18px; /* Adjust font size as desired */
        font-family: Verdana, sans-serif;
    }
    .corner .label {
        padding: 0;
        font-size:9px;
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