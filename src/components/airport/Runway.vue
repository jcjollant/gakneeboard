<script setup>
import {onMounted,ref,watch} from 'vue'

const emits = defineEmits(['update'])


const props = defineProps({
    runway: { type: Object, default: null},
    pattern : { type: Number, default: 0},
    orientation : { type: String, default : null}
})

onMounted(() => {    
    loadProps(props)
})

watch( props, async() => {
    // console.log("RunwayView props changed " + JSON.stringify(props));
    loadProps(props)
})

function loadProps( props) {
    // console.log( 'RunwayView loadProps ' + JSON.stringify(props))
    magneticOrientation = (props.orientation && props.orientation == 'magnetic')
    setNewPatternMode(props.pattern)
}

let patternMode = 0
let showNorthMidField = false
let showNorthTp = true
let showSouthMidField = false
let showSouthTp = true
let magneticOrientation = false;

const myCanvas = ref()
const label = ref('')
const rightTpColor = '#FF9999'
const leftTpColor = '#9999FF'
const leftTpPattern = [10,5]
const rightTpPattern = [10,5,2,5]


function getAngle( orientation) {
    if(orientation < 0) orientation += 360;
    return orientation % 360;
}

function onClick() {
    // Save setting
    patternMode = (patternMode + 1) % 5
    setNewPatternMode( patternMode)
    emits('update', patternMode)
}

function setNewPatternMode( value) {
    // console.log('RunwayView setNewPatternMode ' + value)
    patternMode = value;
    showNorthMidField = (patternMode == 4)
    showNorthTp = (patternMode == 0 || patternMode == 3 || patternMode == 4)
    showSouthMidField = (patternMode == 2)
    showSouthTp = (patternMode == 0 || patternMode == 1 || patternMode == 2)
    show( props.runway)
}

function show(runway) {
    // console.log('RunwayView show', JSON.stringify(runway))
    // Filter out runway with invalid data
    if( !runway || !('name' in runway) || !('ends' in runway) || (runway.ends.length != 2)) return;

    const end0Mag = runway.ends[0].mag;
    var northEnd, southEnd;
    var northRwyIndex, southRwyIndex;
    if( end0Mag >= 90 && end0Mag <= 180 || end0Mag > 180 && end0Mag < 270) {
        northRwyIndex = 1;
        southRwyIndex = 0;
    } else {
        northRwyIndex = 0;
        southRwyIndex = 1;
    }
    northEnd = runway.ends[northRwyIndex];
    southEnd = runway.ends[southRwyIndex];

    if( 'length' in runway) {
        if( 'width' in runway) {
            label.value = runway['length'] + 'x' + runway['width'];
        } else {
            label.value = runway['length'];
        }
    } else {
        dimension.value = '';
    }

    const ctx = myCanvas.value.getContext('2d');
    const referenceSize = 240;
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
    if( magneticOrientation) {
        const angleInRad = Math.PI / 180 * northEnd.mag; // Convert degrees to radians
        ctx.rotate(angleInRad);
    }
    // draw runway at the center
    let rwyColor = 'black'
    if('surface' in runway && 'type' in runway.surface) {
        switch( runway.surface.type) {
            case 'TURF': rwyColor = 'darkgreen'; break
            case 'WATER': rwyColor = 'darkblue'; break
            case 'GRVL':
            case 'GRAVEL': rwyColor = '#777777'; break
            case 'DIRT': rwyColor = '#5C4033'; break
        }
    }
    ctx.fillStyle = rwyColor
    ctx.fillRect( -rwyHWidth, -rwyHLength, rwyWidth, rwyLength);

    // draw runway names
    ctx.font = rwyFontSize + "px Verdana"
    // console.log(ctx.font);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText( southEnd.name, 0, -rwyHLength + rwyFontSize * 1.5);
    ctx.fillText( northEnd.name, 0, rwyHLength - rwyFontSize * 0.5);

    // runway centerline
    if(rwyColor=='black') {
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5, 2])
        ctx.moveTo( 0, -rwyHLength + rwyFontSize * 2);
        ctx.lineTo( 0, rwyHLength - rwyFontSize * 2);
        ctx.stroke();
    }

    // Traffic pattern
    ctx.lineWidth = tpLineWidth;
    ctx.lineCap = 'round';
    ctx.fillStyle = 'black';

    const radius = tpDownwindDist / ( 1.707)

    if( showNorthTp) {
        const centerY = -radius
        // north runway TP (Dashed stroke)
        ctx.beginPath();
        const leftTp = (northEnd.tp == 'L') 
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
            ctx.fillText( getAngle(northEnd.mag - 225)+'°', -tpDownwindDist * 2.5, -tpDownwindDist - 10);
            if(showNorthMidField) {
                const startingAngle = - Math.PI / 4
                const endingAngle = Math.PI / 2
                const centerX = -2 * tpDownwindDist - 0.707 * radius
                ctx.arc( centerX, centerY, radius, startingAngle, endingAngle, true);
                ctx.lineTo( 2 * tpDownwindDist, 0)
                // mid field entry
                ctx.fillText( getAngle(northEnd.mag - 90)+'°', tpDownwindDist * 2.5, 0);
            }
        } else {
            ctx.lineTo( tpDownwindDist, tpBaseDist);
            ctx.lineTo( tpDownwindDist, 0);
            ctx.lineTo( tpDownwindDist * 2, -tpDownwindDist);
            ctx.fillText( getAngle(northEnd.mag - 135)+'°', tpDownwindDist * 2.5, -tpDownwindDist - 10);
            if(showNorthMidField) {
                const startingAngle = - 3 * Math.PI / 4
                const endingAngle = Math.PI / 2
                const centerX = 2 * tpDownwindDist + 0.707 * radius
                ctx.arc( centerX, centerY, radius, startingAngle, endingAngle, false);
                ctx.lineTo( -2 * tpDownwindDist, 0)
                // mid field entry
                ctx.fillText( getAngle(northEnd.mag + 90)+'°', -tpDownwindDist * 2.5, 0);
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
        const leftTp = (southEnd.tp == 'L')
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
            ctx.fillText( getAngle(southEnd.mag - 225)+'°', tpDownwindDist * 2.5, tpDownwindDist + 20);
            if(showSouthMidField) {
                const startingAngle = 3 * Math.PI / 4
                const endingAngle = -Math.PI / 2
                const centerX = 2 * tpDownwindDist + 0.707 * radius
                ctx.arc( centerX, centerY, radius, startingAngle, endingAngle, true);
                ctx.lineTo( -2 * tpDownwindDist, 0)
                // mid field entry
                ctx.fillText( getAngle(northEnd.mag + 90)+'°', -tpDownwindDist * 2.5, 0);
            }
        } else {
            ctx.lineTo( -tpDownwindDist, -tpBaseDist);
            ctx.lineTo( -tpDownwindDist, 0);
            ctx.lineTo( -tpDownwindDist * 2, tpDownwindDist);
            ctx.fillText( getAngle(southEnd.mag - 135)+'°', -tpDownwindDist * 2.5, tpDownwindDist + 20);
            if(showSouthMidField) {
                const startingAngle = Math.PI / 4
                const endingAngle = -Math.PI / 2
                const centerX = -2 * tpDownwindDist - 0.707 * radius
                ctx.arc( centerX, centerY, radius, startingAngle, endingAngle, false);
                ctx.lineTo( 2 * tpDownwindDist, 0)
                // mid field entry
                ctx.fillText( getAngle(northEnd.mag - 90)+'°', tpDownwindDist * 2.5, 0);
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
        <div class="label">{{ label }}</div>
    </div>
</template>

<style scoped>
.container {
    position: relative;
}
.label {
    font-size: 10px;
    position: absolute;
    bottom: 6px;
    width: 100%;
    text-align: center;
}
</style>