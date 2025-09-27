<template>
    <div class="tileContent cloudClear">
        <!-- 14 CFR 103.23 -->
        <div v-for="c in ['B','C','D']" class="className towered" :title="'Class ' + c + ' Airspace'">{{ c }}</div>
        <div class="className untowered" title="Class E Airspace">E</div>
        <div class="className untowered" title="Class G Airspace at Night">Gn</div>
        <div class="className untowered" title="Class G Airspace Day time">Gd</div>
        <div class="classB req" title="3sm visibility and Clear of Clouds">3:cc</div>
        <div class="classEHigh req" title="5sm visibility, 1,000ft above, 1,000ft below, 1sm horizontal">5:111<span class="altMin"  title="Above 10,000 ft MSL">10k MSL</span></div>
        <div class="classCDHigh req" title="3sm visibility, 1,000ft above, 500ft below, 2,000ft horizontal">3:152</div>
        <div class="classCDLow">
            <div class="above">1,000ft</div>
            <div class="at">
                <div class="left">3 sm</div>
                <font-awesome-icon icon="fa-solid fa-cloud" />
                <div class="right">2,000ft</div>
            </div>
            <div class="below">500ft</div>
        </div>
        <div class="classGMid req" title="1sm visibility, 1,000ft above, 500ft below, 2,000ft horizontal">1:152</div>
        <div class="classGLow req" title="1sm visibility and Clear of Clouds">1:cc<span class="altMax" title="Below 1,200ft AGL">1k2 AGL</span></div>
        <!-- <font-awesome-icon icon="fa-solid fa-link" class="link" @click="showRegulation" title="Show Regulation" /> -->
        <div class="svfr req" title="Special VFR 1sm visibility and Clear of Clouds">SVFR 1:cc</div>
    </div>
</template>
<style scoped>
.cloudClear {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-template-rows: 1fr 3fr 3fr 3fr;
}
.cloudClear .altMin {
    position: absolute;
    right: 0;
    bottom : 0;
    font-size: 0.8rem;
}
.cloudClear .altMax {
    position: absolute;
    right: 0;
    top : 0;
    font-size: 0.6rem;
}
.cloudClear .classB {
    grid-row: 2 / span 3;
    grid-column: 1;
    border-right: 1px dashed grey;
}
.cloudClear .classCDHigh {
    grid-row: 2;
    grid-column: 2 / span 2;
}
.cloudClear .classCDLow {
    grid-row: 3 / span 2;
    grid-column: 2 / span 4;
    border-right: 1px dashed grey;
    display: flex;
    flex-flow: column;
    font-size: 0.8rem;
    justify-content: center;
    color: #006;
}
.cloudClear .classCDLow .fa-cloud {
    font-size: 1.5rem;
    color: #006;
    margin: 10px;
}

.cloudClear .classCDLow .at {
    display: flex;
    justify-content: center;
    align-items: center;
}

.cloudClear .classEHigh {
    position: relative;
    grid-row: 2;
    grid-column: 4 / span 3;
    border-bottom: 1px dashed grey;
    border-left: 1px dashed grey;
}
.cloudClear .classGMid {
    grid-row: 3;
    grid-column: 6;
    font-size: 0.8rem;
}
.cloudClear .classGLow {
    position: relative;
    grid-row: 4;
    grid-column: 6;
    border-top: 1px dashed grey;
}
.cloudClear .className {
    font-weight: 600;
    border-bottom: 1px dashed grey;
}

.cloudClear .link {
    position: absolute;
    left: 5px;
    bottom: 5px;
    font-size: 0.7rem;
    color: #666;
    cursor: pointer;
}

.cloudClear .req {
    display: flex;
    justify-content: center;
    align-items: center;
}
.cloudClear .svfr {
    border-top: 1px dashed grey;
    grid-column: 1 / span 6;
    font-size: 0.8rem;
    background-color: lightgrey;
}
.cloudClear .towered {
    color: #006
}

.cloudClear .untowered {
    color: #606
}

</style>