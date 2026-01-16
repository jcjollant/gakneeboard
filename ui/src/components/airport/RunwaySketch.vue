<template>
    <div class="container runway">
        <canvas ref="myCanvas"></canvas>
        <div class="label">{{ label }}</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { RunwayViewSettings } from './RunwayViewSettings'
import { RunwayOrientation } from './RunwayOrientation'
import { TrafficPatternDisplay } from '../../models/TrafficPatternDisplay'
import type { Runway } from '../../models/Airport'
import { Formatter } from '../../lib/Formatter';

const props = withDefaults(defineProps<{
    settings: RunwayViewSettings
    small?: boolean
}>(), {
    small: false
})

let patternMode: TrafficPatternDisplay = TrafficPatternDisplay.None
let showHeadings = false
let showNorthMidField = false
let showNorth45 = false
let showNorthTp = true
let showSouthMidField = false
let showSouth45 = false
let showSouthTp = true
let verticalOrientation = false
let smallDisplay = false

const myCanvas = ref<HTMLCanvasElement>()
const label = ref('')
const rightTpColor = '#FF9999'
const leftTpColor = '#9999FF'
const leftTpPattern = [10, 5]
const rightTpPattern = [10, 5, 2, 5]

onMounted(() => {
    loadProps()
})

watch(() => props.settings, () => {
    loadProps()
}, { deep: true })

watch(() => props.small, () => {
    loadProps()
})

function loadProps() {
    const settings = props.settings ?? new RunwayViewSettings();
    verticalOrientation = settings.orientation === RunwayOrientation.Vertical
    showHeadings = settings.headings

    patternMode = settings.patternMode

    // Logic to map TrafficPatternDisplay to display flags
    const showTp = patternMode !== TrafficPatternDisplay.None
    const isMidfield = patternMode === TrafficPatternDisplay.Midfield
    const is45 = patternMode === TrafficPatternDisplay.Entry45
    // Downwind implies showTp=true, but neither midfield nor 45.

    showNorthTp = showTp
    showSouthTp = showTp
    
    showNorthMidField = isMidfield
    showSouthMidField = isMidfield

    // If Entry45, show 45 leg. If Midfield, show Midfield.
    // Assuming Midfield is distinct from 45.
    showNorth45 = is45
    showSouth45 = is45

    const runway = settings.runway

    if (settings.label) {
        label.value = settings.label;
    } else if (runway && runway.length) {
        if (runway.width) {
            label.value = Formatter.feet(runway.length) + 'x' + Formatter.feet(runway.width);
        } else {
            label.value = Formatter.feet(runway.length);
        }
    }

    smallDisplay = props.small

    if (runway) show(runway)
}

function getAngle(orientation: number) {
    if (orientation < 0) orientation += 360;
    return orientation % 360;
}

function show(runway: Runway) {
    // Filter out runway with invalid data
    if (!runway || !runway.ends || (runway.ends.length != 2)) return;
    if (!myCanvas.value || !myCanvas.value.parentElement) return;

    const end0Mag = runway.ends[0].mag;
    var northEnd, southEnd; // Typed inferred as RunwayEnd
    var northRwyIndex, southRwyIndex;
    if (end0Mag >= 90 && end0Mag <= 180 || end0Mag > 180 && end0Mag < 270) {
        northRwyIndex = 1;
        southRwyIndex = 0;
    } else {
        northRwyIndex = 0;
        southRwyIndex = 1;
    }
    northEnd = runway.ends[northRwyIndex];
    southEnd = runway.ends[southRwyIndex];

    const ctx = myCanvas.value.getContext('2d');
    if (!ctx) return;

    const referenceSize = myCanvas.value.parentElement.clientWidth
    myCanvas.value.width = myCanvas.value.parentElement.clientWidth;
    myCanvas.value.height = myCanvas.value.parentElement.clientHeight;

    const rwyLength = referenceSize * (smallDisplay ? 0.80 : 0.55);
    const rwyHLength = rwyLength / 2;
    const rwyWidth = referenceSize * (smallDisplay ? 0.18 : 0.12);
    const rwyHWidth = rwyWidth / 2;
    const tpDownwindDist = referenceSize * 0.15;
    const tpBaseDist = rwyLength / 2 + tpDownwindDist * 0.65;
    const tpLineWidth = referenceSize * 0.01;
    const tpArrowTip = referenceSize * 0.03;
    const rwyFontSize = Math.round(referenceSize / (smallDisplay ? 12 : 20));


    // Move center to origin
    ctx.translate((referenceSize) / 2, (referenceSize) / 2); // Move back to original position
    if (!verticalOrientation) {
        const angleInRad = Math.PI / 180 * northEnd.mag; // Convert degrees to radians
        ctx.rotate(angleInRad);
    }

    // draw runway pavement
    let rwyFillStyle: string | CanvasPattern = 'black';
    let markingFillStyle = 'white'
    let centerLine = true;
    if (runway.surface && runway.surface.type) {
        switch (runway.surface.type) {
            case 'TURF': // EX S43 15L
                rwyFillStyle = 'darkgreen';
                centerLine = false;
                break
            case 'WATER': // ex: W39
                rwyFillStyle = 'darkblue';
                centerLine = false;
                break
            case 'GRVL':
            case 'GRAVEL':  // ex 00W
                const img = new Image();
                img.src = '/assets/gravel.png';
                const pattern = ctx.createPattern(img, 'repeat');
                if (pattern) {
                    rwyFillStyle = pattern;
                }
                markingFillStyle = 'black';
                centerLine = false;
                break
            case 'DIRT': // ex: O26
                rwyFillStyle = '#5C4033';
                centerLine = false;
                break
            case 'ASPH-CONC': // ex: KRNT
            case 'CONC': rwyFillStyle = '#333333'; break
            case 'SAND': // ex: S16
                rwyFillStyle = '#C2B280';  //#D5C295
                markingFillStyle = 'black';
                centerLine = false;
                break;
            default:
                rwyFillStyle = 'black';
        }
    }
    ctx.fillStyle = rwyFillStyle
    ctx.fillRect(-rwyHWidth, -rwyHLength, rwyWidth, rwyLength);

    // draw runway names
    ctx.font = rwyFontSize + "px Verdana"
    ctx.fillStyle = markingFillStyle;
    ctx.textAlign = 'center';
    ctx.fillText(northEnd.name, 0, rwyHLength - rwyFontSize * 0.5);
    ctx.rotate(Math.PI);
    ctx.fillText(southEnd.name, 0, rwyHLength - rwyFontSize * 0.5);
    ctx.rotate(Math.PI);

    // runway centerline
    if (centerLine) {
        ctx.beginPath();
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5, 2])
        ctx.moveTo(0, -rwyHLength + rwyFontSize * 2);
        ctx.lineTo(0, rwyHLength - rwyFontSize * 2);
        ctx.stroke();
    }

    // Traffic pattern
    ctx.lineWidth = tpLineWidth;
    ctx.lineCap = 'round';
    ctx.fillStyle = 'black';

    const radius = tpDownwindDist / (1.707)

    if (showNorthTp) {
        const centerY = -radius
        // north runway TP (Dashed stroke)
        ctx.beginPath();
        const leftTp = (northEnd.tp == 'L')
        ctx.setLineDash(leftTp ? leftTpPattern : rightTpPattern)
        ctx.strokeStyle = leftTp ? leftTpColor : rightTpColor;
        // Rwy Threshold
        ctx.moveTo(0, rwyHLength);
        // Final
        ctx.lineTo(0, tpBaseDist);
        if (leftTp) {
            // Crosswind
            ctx.lineTo(-tpDownwindDist, tpBaseDist);
            // Downwind
            ctx.lineTo(-tpDownwindDist, 0);
            
            if (showNorth45) {
                // 45 entry
                ctx.lineTo(-tpDownwindDist * 2, -tpDownwindDist);
                // 45 entry label
                if (showHeadings) ctx.fillText(getAngle(northEnd.mag - 225) + '°', -tpDownwindDist * 2.5, -tpDownwindDist - 10);
            }
            
            if (showNorthMidField) {
                const startingAngle = - Math.PI / 4
                const endingAngle = Math.PI / 2
                const centerX = -2 * tpDownwindDist - 0.707 * radius
                ctx.arc(centerX, centerY, radius, startingAngle, endingAngle, true);
                ctx.lineTo(2 * tpDownwindDist, 0)
                // mid field entry
                if (showHeadings) ctx.fillText(getAngle(northEnd.mag - 90) + '°', tpDownwindDist * 2.5, 0);
            }
        } else {
            ctx.lineTo(tpDownwindDist, tpBaseDist);
            ctx.lineTo(tpDownwindDist, 0);
            
            if (showNorth45) {
                ctx.lineTo(tpDownwindDist * 2, -tpDownwindDist);
                if (showHeadings) ctx.fillText(getAngle(northEnd.mag - 135) + '°', tpDownwindDist * 2.5, -tpDownwindDist - 10);
            }

            if (showNorthMidField) {
                const startingAngle = - 3 * Math.PI / 4
                const endingAngle = Math.PI / 2
                const centerX = 2 * tpDownwindDist + 0.707 * radius
                ctx.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
                ctx.lineTo(-2 * tpDownwindDist, 0)
                // mid field entry
                if (showHeadings) ctx.fillText(getAngle(northEnd.mag + 90) + '°', -tpDownwindDist * 2.5, 0);
            }
        }
        ctx.stroke();

        // TP Arrow Tips (full stroke)
        ctx.beginPath();
        ctx.setLineDash([])
        ctx.moveTo(-tpArrowTip, rwyHLength + tpArrowTip);
        ctx.lineTo(0, rwyHLength);
        ctx.lineTo(tpArrowTip, rwyHLength + tpArrowTip);
        ctx.stroke();
    }

    if (showSouthTp) {
        const centerY = radius
        // South Runway TP
        // Final
        ctx.beginPath();
        const leftTp = (southEnd.tp == 'L')
        ctx.setLineDash(leftTp ? leftTpPattern : rightTpPattern)
        ctx.strokeStyle = leftTp ? leftTpColor : rightTpColor;
        ctx.moveTo(0, -rwyHLength);
        // TP Base
        ctx.lineTo(0, -tpBaseDist);
        // Downwind
        if (leftTp) {
            ctx.lineTo(tpDownwindDist, -tpBaseDist);
            ctx.lineTo(tpDownwindDist, 0);
            
            if (showSouth45) {
                ctx.lineTo(tpDownwindDist * 2, tpDownwindDist);
                if (showHeadings) ctx.fillText(getAngle(southEnd.mag - 225) + '°', tpDownwindDist * 2.5, tpDownwindDist + 20);
            }

            if (showSouthMidField) {
                const startingAngle = 3 * Math.PI / 4
                const endingAngle = -Math.PI / 2
                const centerX = 2 * tpDownwindDist + 0.707 * radius
                ctx.arc(centerX, centerY, radius, startingAngle, endingAngle, true);
                ctx.lineTo(-2 * tpDownwindDist, 0)
                // mid field entry
                if (showHeadings) ctx.fillText(getAngle(northEnd.mag + 90) + '°', -tpDownwindDist * 2.5, 0);
            }
        } else {
            ctx.lineTo(-tpDownwindDist, -tpBaseDist);
            ctx.lineTo(-tpDownwindDist, 0);
            
            if (showSouth45) {
                ctx.lineTo(-tpDownwindDist * 2, tpDownwindDist);
                if (showHeadings) ctx.fillText(getAngle(southEnd.mag - 135) + '°', -tpDownwindDist * 2.5, tpDownwindDist + 20);
            }

            if (showSouthMidField) {
                const startingAngle = Math.PI / 4
                const endingAngle = -Math.PI / 2
                const centerX = -2 * tpDownwindDist - 0.707 * radius
                ctx.arc(centerX, centerY, radius, startingAngle, endingAngle, false);
                ctx.lineTo(2 * tpDownwindDist, 0)
                // mid field entry
                if (showHeadings) ctx.fillText(getAngle(northEnd.mag - 90) + '°', tpDownwindDist * 2.5, 0);
            }
        }
        ctx.stroke()

        // TP Arrow Tip (no dash)
        ctx.beginPath()
        ctx.setLineDash([])
        ctx.moveTo(-tpArrowTip, -rwyHLength - tpArrowTip);
        ctx.lineTo(0, -rwyHLength);
        ctx.lineTo(+tpArrowTip, -rwyHLength - tpArrowTip);
        ctx.stroke();
    }

}
</script>

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