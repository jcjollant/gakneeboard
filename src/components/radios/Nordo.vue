<template>
    <div  class="nordo">
        <div class="nordoLights">
            <div title="Light Gun Signal">Signal</div>
            <div class="nordoHeader">Ground</div>
            <div class="nordoHeader">Air</div>
            <div class="nordoLine"></div>
            <div class="lightSteady green">&nbsp;</div>
            <div title="Clear to Take Off"><font-awesome-icon :icon="['fas','check']" class="iconClear" />T/O</div>
            <div title="Clear to Land"><font-awesome-icon :icon="['fas','check']" class="iconClear" />Land</div>
            <div class="nordoLine"></div>
            <div class="lightFlashing green"><font-awesome-icon v-for="i in [0,1,2]" :icon="['fas','sun']" /></div>
            <div title="Clear to Taxi"><font-awesome-icon :icon="['fas','check']" class="iconClear" />Taxi</div>
            <div title="Return to Land"><font-awesome-icon :icon="['fas','rotate-left']" class="iconReturn" />Land</div>
            <div class="nordoLine"></div>
            <div class="lightSteady red">&nbsp;</div>
            <div>STOP</div>
            <div>Give Way</div>
            <div class="nordoLine"></div>
            <div class="lightFlashing red"><font-awesome-icon v-for="i in [0,1,2]" :icon="['fas','sun']" /></div>
            <div>Taxi Off Rwy</div>
            <div title="Do Not Land. Airport is unsafe"><font-awesome-icon :icon="['fas','times']" class="iconDonot"/> Land</div>
            <div class="nordoLine"></div>
            <div class="lightFlashing"><font-awesome-icon v-for="i in [0,1,2]" :icon="['fas','sun']" :class="{'red': (i % 2), 'green': !(i % 2)}" /></div>
            <div class="nordoCaution">Use Extreme Caution</div>
            <div class="nordoLine"></div>
            <div class="lightFlashing white"><font-awesome-icon v-for="i in [0,1,2]" :icon="['fas','sun']" /></div>
            <div title="Return to Starting Point"><font-awesome-icon :icon="['fas','rotate-left']" class="iconReturn" />Start</div>
            <div>-</div>
            <div class="nordoLine"></div>
        </div>
        <div class="nordoXpdr">
            <div title="Unlawful Interference (aka Hijack)" class="xpdrItem">
                <font-awesome-icon :icon="['fas','jet-fighter']" />
                <div>7500</div>
            </div>
            <div title="Lost Communications" class="xpdrItem">
                <div>
                    <font-awesome-icon :icon="['fas','ban']" class="red"/>
                    <font-awesome-icon :icon="['fas','walkie-talkie']"  />
                </div>
                <div>7600</div>
            </div>
            <div title="Declare Emergency">
                <font-awesome-icon :icon="['fas','star-of-life']" class="red" />
                <div>7700</div>
            </div>
        </div>
    </div>
</template>
<style>
.iconClear {
    color: #090;
    padding-right: 3px;
    font-weight: 600;
}
.iconDonot {
    color: #900;
    padding-right: 3px;
    font-weight: 600;
}
.iconReturn {
    padding-right: 3px;
    font-weight: 600;
}

.lightFlashing {
    display: flex;
    justify-content: center;
    gap: 3px;
    padding: 2px;
}
.lightFlashing.green, .lightFlashing > .green {
    color: green;
}
.lightFlashing.red, .lightFlashing > .red {
    color: red;
}
.lightFlashing.white {
    color: white;
    background-color: darkgrey;
}
.lightSteady {
    border-radius: 8px;
    margin: 0 8px;
}
.lightSteady.green {
    background-color: green;
}
.lightSteady.red {
    background-color: red;
}

.nordo {
    position: relative;
    height: 100%;
    font-size: 0.8rem;
    display: flex;
    flex-flow: column;
    justify-content: space-between;
}
.nordoCaution {
    grid-column: 2 / span 2
}
.nordoHeader {
    font-weight: 600;
    text-align: center;
}
.nordoLights {
    display: grid;
    grid-template-columns: 60px 1fr 1fr;
    justify-content: center;
    align-items: center;
    padding-top: 5px;
}
.nordoLine {
    height: 1px;
    grid-column: 1 / span 3;
    border-bottom: 1px dashed darkgrey;
    padding-top: 5px;
    margin-bottom: 5px;;
}
.nordoXpdr {
    display: flex;
    /* gap: 10px; */
    font-size: 1rem;
    justify-content: space-around;
    align-items: center;
    padding-bottom: 5px;
}
.red {
    color: red;
}
.xpdrItem {
    display: flex;
    flex-flow: column;
    gap: 5px;
}
</style>