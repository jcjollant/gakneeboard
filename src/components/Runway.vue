<script setup>

import {ref, onMounted, watch} from 'vue';

var rwyIndex;
const props = defineProps({
    airport: { type: Object, required: true},
    rwyIndex: { type: Number, default: 0}
})

const airportName = ref()
const weatherFreq = ref()
const weatherType = ref()
const trafficFreq = ref()
const trafficType = ref()
const elevation = ref()
const tpa = ref()
const myCanvas = ref()
const multipleRunways = ref(false)

function cycleRunway() {
    // console.log( "Rwy Count " + props.airport.rwy.length);
    rwyIndex = ( rwyIndex + 1) % props.airport.rwy.length
    // console.log('rwyIndex ' + rwyIndex)
    show( props.airport)
}

// add initialization code 
onMounted(() => {    
    rwyIndex = props.rwyIndex;
    multipleRunways.value = props.airport.rwy.length > 1
    show( props.airport)
})

watch( props, async() => {
    // console.log("props changed");
    multipleRunways.value = props.airport.rwy.length > 1
    show(props.airport)
})


function show( airport) {
    const runway = airport.rwy[rwyIndex];

    airportName.value = airport.airportCode + ' : ' + airport.airportName
    weatherFreq.value = airport.weather.freq;
    weatherType.value = airport.weather.type
    // If traffic is runway specific, it will be specified in the runway data
    trafficFreq.value = ('freq' in runway) ? runway.freq : airport.traffic.freq;
    trafficType.value = airport.traffic.type;
    elevation.value = airport.elev;
    tpa.value = airport.tpa;

    // console.log('runway ' + JSON.stringify(runway))
    const [firstRwyName,secondRwyName] = runway.name.split('-');
    const r1o = runway[firstRwyName].orientation;
    var northRwy, southRwy;
    var northRwyName, southRwyName;
    if( r1o >= 90 && r1o <= 180 || r1o > 180 && r1o < 270) {
        northRwyName = secondRwyName;
        southRwyName = firstRwyName;
    } else {
        northRwyName = firstRwyName;
        southRwyName = secondRwyName;
    }
    northRwy = runway[northRwyName];
    southRwy = runway[southRwyName];
    // console.log('North runway ' + JSON.stringify(northRwy))
    // console.log('South runway ' + JSON.stringify(southRwy))

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
    ctx.fillStyle = ( runway.surface.type=='TURF' ? 'darkgreen' : 'black');
    ctx.fillRect( -rwyHWidth, -rwyHLength, rwyWidth, rwyLength);

    // draw runway names
    ctx.font = rwyFontSize + "px Verdana"
    // console.log(ctx.font);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText( southRwyName, 0, -rwyHLength + rwyFontSize * 1.5)
    ctx.fillText( northRwyName, 0, rwyHLength - rwyFontSize * 0.5);
    
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
}

</script>


<template>
    <div class="widget">
        <div class="widgetTitle">{{airportName}}</div>
        <div class="content">
            <div class="corner top left"><div>{{weatherFreq}}</div><div class="label">{{weatherType}}</div></div>
            <div class="corner top right"><div>{{trafficFreq}}</div><div class='label'>{{trafficType}}</div></div>
            <div class="corner bottom left"><div class='label'>Elev</div><div>{{ elevation }}</div></div>
            <div class="corner bottom right"><div class='label'>TPA</div><div>{{ tpa }}</div></div>
            <div @click="cycleRunway()" :class="{clickable: multipleRunways}">
                <canvas ref="myCanvas"></canvas>
            </div>
        </div>
    </div>    
</template>
<style scoped>
    .corner {
        position: absolute; /* Absolute positioning within container */
        padding: 5px; /* Adjust padding for better visibility */
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
    .clickable {
        cursor: pointer;
    }
</style>