<template>
    <div class="widget">
        <div class="widgetTitle"><div class="info"></div>ATIS</div>
        <div class="content atis">
            <div class="wind box">
                <div class="label">Wind</div>
            </div>
            <div class="runway box">
                <div class="label">Rwy</div>
            </div>
            <div class="visibility box">
                <div class="label">Vis</div>
            </div>
            <div class="sky box">
                <div class="label">Sky</div>
            </div>
            <div class="temp box">
                <div class="label">Temp</div>
            </div>
            <div class="altitude box">
                <div class="label">Alt</div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.widgetTitle {
    position: relative;
}
.info {
    position: absolute;
    left:0;
    top:0;
    width:40px;
    height: 100%;
    border-right: 1px dashed darkgrey;
}
.atis {
    display: grid;
    grid-template-columns: auto auto auto auto;
}
.label {
    position: absolute;
    left: 3px;
    top: 0;
    font-size: 10px;
}
.box {
    position: relative;
}
.wind {
    grid-column: 1 / span 3;
    /* border: 1px solid blue; */
    border-bottom: 1px dashed darkgrey;
    border-right: 1px dashed darkgrey;
}
.runway {
    border-bottom: 1px dashed darkgrey;
}
.sky {
    grid-column: 3 / span 2;
    grid-row: 2 / span 3;
    /* border: 1px solid yellow; */
    border-left: 1px dashed darkgrey;
}
.visibility {
    grid-row: 2;
    grid-column: 1 / span 2;
    border-bottom: 1px dashed darkgrey;
}
.temp {
    grid-row: 3;
    grid-column: 1 / span 2;
    border-bottom: 1px dashed darkgrey;
}
.altitude {
    grid-row: 4;
    grid-column: 1 / span 2;
}
</style>