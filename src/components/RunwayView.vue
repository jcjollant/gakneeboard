<script setup>

import {onMounted,ref,watch} from 'vue'
const props = defineProps({
    runway: { type: Object, default: null}
})

const myCanvas = ref()
const dimensions = ref('')

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

    if( 'length' in runway) {
        if( 'width' in runway) {
            dimensions.value = runway['length'] + 'x' + runway['width'];
        } else {
            dimensions.value = runway['length'] + 'x' + runway['width'];
        }
    } else {
        dimension.value = '';
    }

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


    // Move center to origin
    ctx.translate((referenceSize) / 2, (referenceSize) / 2); // Move back to original position
    // const angleInRad = Math.PI / 180 * northRwy.orientation; // Convert degrees to radians
    // ctx.rotate(angleInRad);
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
    ctx.lineCap = 'round';

    // north runway TP (Dashed stroke)
    ctx.beginPath();
    ctx.setLineDash([10,5])
    ctx.strokeStyle = '#FF9999';
    // Final
    ctx.moveTo( 0, rwyHLength);
    // Base
    ctx.lineTo( 0, tpBaseDist);
    // Downwind
    ctx.fillStyle = 'black';
    if(northRwy.pattern == 'right') {
        ctx.lineTo( tpDownwindDist, tpBaseDist);
        ctx.lineTo( tpDownwindDist, 0);
        ctx.lineTo( tpDownwindDist * 2, -tpDownwindDist);
        ctx.fillText( getFourtyFive(northRwy.orientation - 135)+'°', tpDownwindDist * 2.5, -tpDownwindDist);
        ctx.stroke();
    } else {
        ctx.lineTo( -tpDownwindDist, tpBaseDist);
        ctx.lineTo( -tpDownwindDist, 0);
        ctx.lineTo( -tpDownwindDist * 2, -tpDownwindDist);
        ctx.fillText( getFourtyFive(northRwy.orientation - 225)+'°', -tpDownwindDist * 2.5, -tpDownwindDist);
        ctx.stroke();
    }
    // TP Arrow Tips (full stroke)
    ctx.beginPath();
    ctx.setLineDash([])
    ctx.moveTo( -tpArrowTip, rwyHLength + tpArrowTip);
    ctx.lineTo( 0, rwyHLength);
    ctx.lineTo( tpArrowTip, rwyHLength + tpArrowTip);
    ctx.stroke();

    // South Runway TP
    // Final
    ctx.beginPath();
    ctx.setLineDash([10,5])
    ctx.strokeStyle = '#9999FF';
    ctx.moveTo( 0, -rwyHLength);
    // TP Base
    ctx.lineTo( 0, -tpBaseDist);
    // Downwind
    if(southRwy.pattern == 'right') {
        ctx.lineTo( -tpDownwindDist, -tpBaseDist);
        ctx.lineTo( -tpDownwindDist, 0);
        ctx.lineTo( -tpDownwindDist * 2, tpDownwindDist);
        ctx.stroke()
        ctx.fillText( getFourtyFive(southRwy.orientation - 135)+'°', -tpDownwindDist * 2.5, tpDownwindDist);
    } else {
        ctx.lineTo( tpDownwindDist, -tpBaseDist);
        ctx.lineTo( tpDownwindDist, 0);
        ctx.lineTo( tpDownwindDist * 2, tpDownwindDist);
        ctx.stroke()
        ctx.fillText( getFourtyFive(southRwy.orientation - 225)+'°', tpDownwindDist * 2.5, tpDownwindDist);
    }
    // TP Arrow Tip (no dash)
    ctx.beginPath()
    ctx.setLineDash([])
    ctx.moveTo( -tpArrowTip, -rwyHLength - tpArrowTip);
    ctx.lineTo( 0, -rwyHLength);
    ctx.lineTo( +tpArrowTip, -rwyHLength - tpArrowTip);
    ctx.stroke();

}
</script>

<template>
    <div class="container">
        <canvas ref="myCanvas"></canvas>
        <div class="dimensions">{{ dimensions }}</div>
    </div>
</template>

<style scoped>
.container {
    position: relative;
}
.dimensions {
    font-size: 10px;
    position: absolute;
    bottom: 6px;
    width: 100%;
    text-align: center;
}
</style>