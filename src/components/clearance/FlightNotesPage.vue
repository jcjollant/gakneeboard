<template>
    <div class="contentPage flightNotesPage">
        <div class="top">
            <div class="logo"><font-awesome-icon :icon="['fas','camera']" /></div>
            <div class="topRight">
                <Header title="FLIGHT NOTES" :page="true" @replace="emits('replace')"></Header>
                <div class="line1">
                    <LabelInput label="DATE:" />
                    <LabelInput label="TAIL #:" />
                </div>
                <div class="line2">
                    <LabelInput label="PILOT:" />
                    <LabelInput label="# PAX:" />
                </div> 
            </div>
        </div>
        <FlightNotesWeather />
        <div class="departureAirport">
            <div></div>
            <div class="departureTaxi taxi">
                <div>TAXI TO RWY:</div>
                <div>&nbsp</div>
                <div>via:</div>
                <div>&nbsp</div>
                <div class="rightAlign">
                    <div>CROSS</div>
                    <div>HOLD SHORT</div>
                </div>
                <div>&nbsp</div>
            </div>
        </div>
        <div class="departureBriefing">
            <div class="dbHeader">DEPARTURE BRIEFING</div>
            <div class="dbList padded">
                <div class="dbLine1">
                    <LabelInput label="TAKEOFF RWY/INT:" />
                    <LabelInput label="DIST REQ:" />
                    <LabelInput label="DIST AVAIL:" />
                </div>
                <div class="dbLine2">
                    <LabelInput label="ABORT PLAN: Reject the takeoff if not airborne by" />
                </div>
                <div class="dbLine3">
                    <LabelInput label="INITIAL ATTITUDE:" />
                    <LabelInput label="INITIAL HEADING/FIX:" />
                </div>
            </div>
        </div>

        <FlightNotesWeather />
        <div class="arrivalAirport">
            <div class="approach padded">
                <LabelInput label="APPROACH:" />
                <LabelInput label="MDA/DA:" />
                <LabelInput label="MSA:" />
            </div>
            <div class="arrivalTaxi taxi">
                <div>TAXI to PARKING via:</div>
                <div>&nbsp</div>
                <div class="rightAlign">
                    <div>CROSS</div>
                    <div>HOLD SHORT</div>
                </div>
                <div>&nbsp</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import FlightNotesWeather from './FlightNotesWeather.vue';
import Header from '../shared/Header.vue';
import LabelInput from '../shared/LabelInput.vue';

const emits = defineEmits(['replace']);
</script>


<style scoped>
.approach {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    border-bottom: 1px solid black;
}
.arrivalAirport {
    border: 1px solid black;
}
.arrivalTaxi {
    grid-template-columns: 2fr 1fr 1fr 4fr 2fr 2fr;
}
.dbHeader {
    border-bottom: 1px dashed grey;
    line-height: 1.2rem;
}
.dbLine1, .dbLine3 {
    display: grid;
    gap: 10px;
}
.dbLine1 {
    grid-template-columns: 75fr 50fr 55fr;
}
.dbLine3 {
    grid-template-columns: 9fr 10fr;
}
.dbList {
    display: flex;
    flex-flow: column;
    gap: 5px;
}
.departureAirport {
    border: 1px solid black;
}
.departureBriefing {
    border: 1px solid black;
}
.departureTaxi {
    grid-template-columns: 2fr 1fr 1fr 4fr 2fr 2fr;
}
.flightNotesPage {
    display: flex; 
    flex-direction: column;
    gap: 10px;
    font-size: 13px;
}
.line1, .line2 {
    display: grid;
    gap: 10px;
}
.line1 {
    grid-template-columns: 1fr 1fr;
}
.line2 {
    grid-template-columns: 75fr 45fr;
}
.logo {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 50px;
    color: blue;
}
.padded {
    padding: 5px;
}
.taxi {
    display: grid;
    text-align: left;
    padding: 5px 10px;
    align-items: center;
}
.top {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 20px;
    padding-bottom: 5px;
}
.topRight {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 15px;
}
.underline {
    border-bottom: 1px solid black;
}
</style>