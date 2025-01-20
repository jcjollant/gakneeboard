<template>
    <div class="tileContent departure">
        <div class="row bb">
            <div class="boxAtis box br">
                <div class="tileBoxLabel">Atis</div>
            </div>
            <div class="boxGround box br">
                <div class="tileBoxLabel">Grnd</div>
            </div>
            <div class="boxTower box">
                <div class="tileBoxLabel">Twr</div>
            </div>
        </div>
        <div class="row bb">
            <div class="boxInfo box br">
                <div class="tileBoxLabel">Info</div>
            </div>
            <div class="boxWind box br">
                <div class="tileBoxLabel">Wind</div>
            </div>
            <div class="boxAltimeterSetting box br">
                <div class="tileBoxLabel">Altimeter</div>
            </div>
            <div class="boxRunway box">
                <div class="tileBoxLabel">Rwy</div>
            </div>
        </div>
        <div class="row bb">
            <div class="boxClearedTo box br">
                <div class="tileBoxLabel">To</div>
                <div class="watermrk">C</div>
            </div>
            <div class="boxRoute box">
                <div class="tileBoxLabel">Route</div>
                <div class="watermrk">R</div>
            </div>
        </div>
        <div class="row">
            <div class="boxAltitudes box br">
                <div class="tileBoxLabel">Alt/Exp</div>
                <div class="watermrk">A</div>
            </div>
            <div class="boxFrequency box br">
                <div class="tileBoxLabel">Freq</div>
                <div class="watermrk">F</div>
            </div>
            <div class="boxTransponder box">
                <div class="tileBoxLabel">XPDR</div>
                <div class="watermrk">T</div>
            </div>
        </div>
        <!-- <div class="boxFrequencyH box">
            <div class="label">Freq.</div>
            <div class="watermrk">F</div>
        </div>
        <div class="boxTransponder box">
            <div class="label">Xpdr</div>
            <div class="watermrk">T</div>
        </div> -->
    </div>
</template>


<style scoped>
.box {
  position: relative;
}

.bb {
    border-bottom: 1px dashed darkgrey;
}

.br {
    border-right: 1px dashed darkgrey;
}

.row {
    display: flex;
}

.boxAtis {
    flex-grow: 6;
}
.boxGround {
    flex-grow: 6;
}
.boxTower {
    flex-grow: 6;
}
.boxInfo {
    flex-grow: 1.5;
}
.boxWind {
    flex-grow: 4.5;
}
.boxAltimeterSetting {
    flex-grow: 3;
}
.boxRunway {
    flex-grow: 2.5;
}
.boxClearedTo {
    flex-grow: 4;
}
.boxRoute {
    flex-grow: 10;
}
.boxAltitudes {
    flex-grow: 3;
}
.boxFrequency {
    flex-grow: 5;
}
.boxTransponder {
    flex-grow: 4;
}
.departure {
    display: grid;
    grid-template-rows: repeat(4, 1fr);
}

.watermrk {
    line-height: 1;
    font-weight:600;
    font-size: 30px;
    position:absolute;
    left: 2px;
    bottom: 2px;
    opacity: 0.2;
}

</style>