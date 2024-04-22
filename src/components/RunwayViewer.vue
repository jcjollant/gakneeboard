<script setup>

import {onMounted,ref,watch} from 'vue'
const props = defineProps({
    runway: { type: Object, default: null}
})

const myCanvas = ref()

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
    <div>
        <canvas ref="myCanvas"></canvas>
    </div>
</template>