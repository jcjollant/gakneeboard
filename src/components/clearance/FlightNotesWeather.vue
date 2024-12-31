<template>
    <div class="weather">
        <div class="top">DEP ATIS</div>
        <div class="top">WIND</div>
        <div class="top">VIS</div>
        <div class="top">SKY COND.</div>
        <div class="top">TEMP/DP</div>
        <div class="top">BARO</div>
        <div class="top">APPROACHES</div>
        <div class="top">RUNWAY(S)</div>
        <div></div>
        <div class="wind"><div>@</div><div class="gust">GUST</div></div>
        <div></div>
        <div class="skyCondition">
            <div v-for="letter in ['C','F','S','B','O']">{{ letter }}</div>
        </div>
        <div class="temp">/</div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</template>

<style scoped>
.gust {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 5px;
}
.weather {
    display: grid;
    grid-template-columns: 23fr 28fr 12fr 26fr 23fr 25fr 30fr 25fr;
    grid-template-rows: 1fr 3fr;
    width: 100%;
    border: 1px solid black;
    border-right: none;
    font-size: 11px;
} 
.weather > div {
    border-right: 1px solid black;
}
.wind {
    display: grid;
    grid-template-rows: auto auto;
}
.top {
    text-align: center;
    padding: 3px 0;
    border-bottom: 1px dashed grey;
}

.rightAlign {
    text-align: right;
}
.skyCondition {
    display: flex;
    justify-content: space-around;
    font-weight: bolder;
    opacity: 0.5;
}
.temp {
    font-weight: 100;
    font-size: 30px;
    color: lightgrey;
}
</style>