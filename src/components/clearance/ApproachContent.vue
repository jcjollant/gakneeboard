<template>
    <div class="tileContent approach">
        <div class="apch label bb br">APCH/RWY</div>
        <div class="crs label bb br">CRS</div>
        <div class="iloc label bb">ILOC</div>
        <div class="atis label bb br">ATIS</div>
        <div class="atc label bb br">ATC</div>
        <div class="twr label bb">TWR/CTAF</div>
        <div class="fixes label bb">Fixes</div>
        <div class="min label bb">Min.</div>
        <div class="missed label">Missed<span class="climb">&#8593;</span></div>
    </div>
</template>

<style scoped>
.approach {
    display: grid;
    position: relative;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(4, auto);
    font-size: 10px;
    text-align: left;
}
.label {
    padding-left: 2px;
}
.bb {
    border-bottom: 1px dashed grey;
}
.br {
    border-right: 1px dashed grey;
}
.apch, .iaf {
    grid-column: 1 / span 5;
}
.crs {
    grid-column: 6 / span 3;
}
.iloc {
    grid-column: 9 / span 4;
}
.atis {
    grid-column: 1 / span 4;
}
.atc {
    grid-column: 5 / span 4;
}
.twr {
    grid-column: 9 / span 4;
}
.fixes {
    grid-column: 1 / span 9;
}
.min {
    text-align: right;
    padding-right: 2px;
    grid-column: 10 / span 3;
}
.missed {
    position: relative;
    grid-column: 1 / span 12;
}
.climb {
    position: absolute;
    font-size: xx-large;
    left: 5px;
    top: 10px;
}
</style>