<script setup>

import {onMounted,ref,watch} from 'vue'
const props = defineProps({
    runway: { type: Object, default: null}
})

let patternMode = 0
let showNorthMidField = false
let showNorthTp = true
let showSouthMidField = false
let showSouthTp = true

const myCanvas = ref()
const dimensions = ref('')
const rightTpColor = '#FF9999'
const leftTpColor = '#9999FF'
const leftTpPattern = [10,5]
const rightTpPattern = [10,5,2,5]

function getAngle( orientation) {
    if(orientation < 0) orientation += 360;
    return orientation % 360;
}

function onClick() {
    patternMode = (patternMode + 1) % 5
    // console.log( 'patternMode = ' + patternMode)
    showNorthMidField = (patternMode == 4)
    showNorthTp = (patternMode == 0 || patternMode == 3 || patternMode == 4)
    showSouthMidField = (patternMode == 2)
    showSouthTp = (patternMode == 0 || patternMode == 1 || patternMode == 2)
    // console.log( 'NMF ' + showNorthMidField + ' NTP ' + showNorthTp + ' SMF '+ showSouthMidField + ' STP ' + showSouthTp)
    show(props.runway)
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
    const rwyWidth = referenceSize * 0.12;
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
    let rwyColor = 'black'
    switch( runway.surface.type) {
        case 'TURF': rwyColor = 'darkgreen'; break
        case 'WATER': rwyColor = 'darkblue'; break
        case 'GRVL':
        case 'GRAVEL': rwyColor = '#777777'; break
        case 'DIRT': rwyColor = '#5C4033'; break
    }
    ctx.fillStyle = rwyColor
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
    ctx.fillStyle = 'black';

    const radius = tpDownwindDist / ( 1.707)

    if( showNorthTp) {
        const centerY = -radius
        // north runway TP (Dashed stroke)
        ctx.beginPath();
        const leftTp = (northRwy.pattern == 'left') 
        ctx.setLineDash( leftTp ? leftTpPattern : rightTpPattern)
        ctx.strokeStyle = leftTp ? leftTpColor : rightTpColor;
        // Rwy Threshold
        ctx.moveTo( 0, rwyHLength);
        // Final
        ctx.lineTo( 0, tpBaseDist);
        if(leftTp) {
            // Crosswind
            ctx.lineTo( -tpDownwindDist, tpBaseDist);
            // Downwind
            ctx.lineTo( -tpDownwindDist, 0);
            // 45 entry
            ctx.lineTo( -tpDownwindDist * 2, -tpDownwindDist);
            // 45 entry label
            ctx.fillText( getAngle(northRwy.orientation - 225)+'°', -tpDownwindDist * 2.5, -tpDownwindDist - 10);
            if(showNorthMidField) {
                const startingAngle = - Math.PI / 4
                const endingAngle = Math.PI / 2
                const centerX = -2 * tpDownwindDist - 0.707 * radius
                ctx.arc( centerX, centerY, radius, startingAngle, endingAngle, true);
                ctx.lineTo( 2 * tpDownwindDist, 0)
                // mid field entry
                ctx.fillText( getAngle(northRwy.orientation - 90)+'°', tpDownwindDist * 2.5, 0);
            }
        } else {
            ctx.lineTo( tpDownwindDist, tpBaseDist);
            ctx.lineTo( tpDownwindDist, 0);
            ctx.lineTo( tpDownwindDist * 2, -tpDownwindDist);
            ctx.fillText( getAngle(northRwy.orientation - 135)+'°', tpDownwindDist * 2.5, -tpDownwindDist - 10);
            if(showNorthMidField) {
                const startingAngle = - 3 * Math.PI / 4
                const endingAngle = Math.PI / 2
                const centerX = 2 * tpDownwindDist + 0.707 * radius
                ctx.arc( centerX, centerY, radius, startingAngle, endingAngle, false);
                ctx.lineTo( -2 * tpDownwindDist, 0)
                // mid field entry
                ctx.fillText( getAngle(northRwy.orientation + 90)+'°', -tpDownwindDist * 2.5, 0);
            }
        }
        ctx.stroke();

        // TP Arrow Tips (full stroke)
        ctx.beginPath();
        ctx.setLineDash([])
        ctx.moveTo( -tpArrowTip, rwyHLength + tpArrowTip);
        ctx.lineTo( 0, rwyHLength);
        ctx.lineTo( tpArrowTip, rwyHLength + tpArrowTip);
        ctx.stroke();
    }

    if( showSouthTp) {
        const centerY = radius
        // South Runway TP
        // Final
        ctx.beginPath();
        const leftTp = (southRwy.pattern == 'left')
        ctx.setLineDash(leftTp ? leftTpPattern : rightTpPattern)
        ctx.strokeStyle = leftTp ? leftTpColor : rightTpColor;
        ctx.moveTo( 0, -rwyHLength);
        // TP Base
        ctx.lineTo( 0, -tpBaseDist);
        // Downwind
        if(leftTp) {
            ctx.lineTo( tpDownwindDist, -tpBaseDist);
            ctx.lineTo( tpDownwindDist, 0);
            ctx.lineTo( tpDownwindDist * 2, tpDownwindDist);
            ctx.fillText( getAngle(southRwy.orientation - 225)+'°', tpDownwindDist * 2.5, tpDownwindDist + 15);
            if(showSouthMidField) {
                const startingAngle = 3 * Math.PI / 4
                const endingAngle = -Math.PI / 2
                const centerX = 2 * tpDownwindDist + 0.707 * radius
                ctx.arc( centerX, centerY, radius, startingAngle, endingAngle, true);
                ctx.lineTo( -2 * tpDownwindDist, 0)
                // mid field entry
                ctx.fillText( getAngle(northRwy.orientation + 90)+'°', -tpDownwindDist * 2.5, 0);
            }
        } else {
            ctx.lineTo( -tpDownwindDist, -tpBaseDist);
            ctx.lineTo( -tpDownwindDist, 0);
            ctx.lineTo( -tpDownwindDist * 2, tpDownwindDist);
            ctx.fillText( getAngle(southRwy.orientation - 135)+'°', -tpDownwindDist * 2.5, tpDownwindDist + 15);
            if(showSouthMidField) {
                const startingAngle = Math.PI / 4
                const endingAngle = -Math.PI / 2
                const centerX = -2 * tpDownwindDist - 0.707 * radius
                ctx.arc( centerX, centerY, radius, startingAngle, endingAngle, false);
                ctx.lineTo( 2 * tpDownwindDist, 0)
                // mid field entry
                ctx.fillText( getAngle(northRwy.orientation - 90)+'°', tpDownwindDist * 2.5, 0);
            }
        }
        ctx.stroke()

        // TP Arrow Tip (no dash)
        ctx.beginPath()
        ctx.setLineDash([])
        ctx.moveTo( -tpArrowTip, -rwyHLength - tpArrowTip);
        ctx.lineTo( 0, -rwyHLength);
        ctx.lineTo( +tpArrowTip, -rwyHLength - tpArrowTip);
        ctx.stroke();
    }

}
</script>

<template>
    <div class="container clickable" @click="onClick">
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