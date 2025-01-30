<template>
    <div class="tileContent approach">
        <div class="row bb">
            <div class="atis tileBoxLabel br">ATIS</div>
            <div class="iloc tileBoxLabel br">ILOC</div>
            <div class="crs tileBoxLabel">CRS</div>
        </div>
        <div class="row bb">
            <div class="atc tileBoxLabel br">App Con</div>
            <div class="twr tileBoxLabel br">Tower / CTAF</div>
            <div class="gnd tileBoxLabel">Ground</div>
        </div>
        <div class="row bb">
            <div class="fixes tileBoxLabel br">IAF</div>
            <div class="alt tileBoxLabel br">IAF Alt</div>
            <div class="min tileBoxLabel">Minimum</div>
        </div> 
        <div class="row">
            <div class="missed tileBoxLabel">Missed<span class="climb">&#8593;</span></div>
        </div>
    </div>
</template>

<style scoped>
.approach {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
}

.row {
    display: flex;
}

.tileBoxLabel {
    text-align: start;
    padding: 2px;
    position: relative;
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
.atis, .atc, .twr, .iloc, .apch, .crs, .gnd, .fixes, .alt, .min {
    /* flex-grow: 1; */
    flex: 1 1 0px;
}

.missed {
    position: relative;
}
.climb {
    position: absolute;
    font-size: xx-large;
    left: 5px;
    top: 10px;
}
</style>