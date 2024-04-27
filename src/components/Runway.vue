<script setup>

import {onMounted,ref,watch} from 'vue'
const props = defineProps({
    runway: { type: Object, default: null}
})

const myCanvas = ref()

function getFourtyFive( orientation) {
    if(orientation < 0) orientation += 360;
    return orientation;
}

onMounted(() => {    
    show( props.runway)
})

watch( props, async() => {
    // console.log("props changed");
    show(props.runway)
})

function show(runway) {
    // console.log('runway ' + JSON.stringify(runway))
    if( runway == null || !('name' in runway)) return;
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
    ctx.fillStyle = ( runway.surface.type=='TURF' ? 'darkgreen' : runway.surface.type=='WATER' ? 'darkblue' : 'black');
    ctx.fillRect( -rwyHWidth, -rwyHLength, rwyWidth, rwyLength);

    // draw runway names
    ctx.font = rwyFontSize + "px Verdana"
    // console.log(ctx.font);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText( southRwyName, 0, -rwyHLength + rwyFontSize * 1.5);
    ctx.fillText( northRwyName, 0, rwyHLength - rwyFontSize * 0.5);
    
    // Traffic pattern
    ctx.lineWidth = tpLineWidth;
    ctx.strokeStyle = 'grey';
    ctx.lineCap = 'round';

    // north runway TP (Dashed stroke)
    ctx.beginPath();
    ctx.setLineDash([10,5])
    // Final
    ctx.moveTo( 0, rwyHLength);
    // Base
    ctx.lineTo( 0, tpBaseDist);
    // Downwind
    if(northRwy.pattern == 'right') {
        ctx.lineTo( tpDownwindDist, tpBaseDist);
        ctx.lineTo( tpDownwindDist, 0);
        ctx.lineTo( tpDownwindDist * 2, -tpDownwindDist);
        ctx.stroke();
        ctx.fillText( getFourtyFive(northRwy.orientation - 135), tpDownwindDist * 2, -tpDownwindDist);
    } else {
        ctx.lineTo( -tpDownwindDist, tpBaseDist);
        ctx.lineTo( -tpDownwindDist, 0);
        ctx.lineTo( -tpDownwindDist * 2, -tpDownwindDist);
        ctx.stroke();
        ctx.fillText( getFourtyFive(northRwy.orientation - 225), -tpDownwindDist * 2, -tpDownwindDist);
    }

    // South Runway TP
    // Final
    ctx.moveTo( 0, -rwyHLength);
    // TP Base
    ctx.lineTo( 0, -tpBaseDist);
    // Downwind
    if(southRwy.pattern == 'right') {
        ctx.lineTo( -tpDownwindDist, -tpBaseDist);
        ctx.lineTo( -tpDownwindDist, 0);
        ctx.lineTo( -tpDownwindDist * 2, tpDownwindDist);
        ctx.stroke()
        ctx.fillText( getFourtyFive(southRwy.orientation - 135), -tpDownwindDist * 2, tpDownwindDist);
    } else {
        ctx.lineTo( tpDownwindDist, -tpBaseDist);
        ctx.lineTo( tpDownwindDist, 0);
        ctx.lineTo( tpDownwindDist * 2, tpDownwindDist);
        ctx.stroke()
        ctx.fillText( getFourtyFive(southRwy.orientation - 225), tpDownwindDist * 2, tpDownwindDist);
    }

    // TP Arrow Tips (full stroke)
    // North Rwy
    ctx.beginPath()
    ctx.setLineDash([])
    ctx.moveTo( -tpArrowTip, rwyHLength + tpArrowTip);
    ctx.lineTo( 0, rwyHLength);
    ctx.lineTo( tpArrowTip, rwyHLength + tpArrowTip);
    
    ctx.moveTo( -tpArrowTip, -rwyHLength - tpArrowTip);
    ctx.lineTo( 0, -rwyHLength);
    ctx.lineTo( +tpArrowTip, -rwyHLength - tpArrowTip);
    ctx.stroke();

}
</script>

<template>
    <div>
        <canvas ref="myCanvas"></canvas>
    </div>
</template>