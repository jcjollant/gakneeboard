<template>
    <div  class="tileContent clearance">
        <div class="boxCleared box bb">
            <div class="tileBoxLabel">To</div>
            <div class="watermrk">C</div>
        </div>
        <div class="boxRouteV box">
            <div class="tileBoxLabel">Route / Notes</div>
            <div class="watermrk">R</div>
        </div>
        <div class="boxAltitudeV box bb">
            <div class="tileBoxLabel">Altitude</div>
            <div class="watermrk">A</div>
        </div>
        <div class="boxFrequencyV box bb">
            <div class="tileBoxLabel">Freq.</div>
            <div class="watermrk">F</div>
        </div>
        <div class="boxTransponder box">
            <div class="tileBoxLabel">Xpdr</div>
            <div class="watermrk">T</div>
        </div>
    </div>
</template>

<style scoped>
.clearance {
    display: grid;
    grid-template-columns: 3fr 5fr;
    grid-template-rows: repeat(4, 1fr);
}

.box {
  position: relative;
}

.bb {
    border-bottom: 1px dashed darkgrey;
}

.boxRouteV {
    grid-column: 2;
    grid-row: 1 / span 4;
    border-left: 1px dashed darkgrey
}

.tileContent {
    cursor: pointer;
}

.watermrk {
    line-height: 1;
    font-weight:600;
    font-size: 15px;
    position:absolute;
    left: 2px;
    bottom: 2px;
    opacity: 0.2;
}

</style>
