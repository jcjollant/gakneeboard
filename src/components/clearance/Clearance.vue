<script setup>
import { ref } from 'vue'
import Header from '../shared/Header.vue';
import NoSettings from '../shared/NoSettings.vue';

const emits = defineEmits(['replace'])
const mode = ref('')

function onMenuClick() {
    mode.value = (mode.value == '' ? 'edit' : '')
}

</script>
<template>
    <div class="tile">
        <Header :title="'Clearance @'" :left="true" :hideReplace="mode!='edit'"
            @click="onMenuClick" @replace="emits('replace')"></Header>
        <div v-if="mode==''" class="content clearance">
            <div class="cleared box">
                <div class="label">To</div>
                <div class="watermrk">C</div>
            </div>
            <div class="route box">
                <div class="label">Route</div>
                <div class="watermrk">R</div>
            </div>
            <div class="altitude box">
                <div class="label">Altitude</div>
                <div class="watermrk">A</div>
            </div>
            <div class="expect box">
                <div class="label">Exp.</div>
            </div>
            <div class="frequency box">
                <div class="label">Freq.</div>
                <div class="watermrk">F</div>
            </div>
            <div class="transponder box">
                <div class="label">Xpdr</div>
                <div class="watermrk">T</div>
            </div>
        </div>
        <NoSettings v-else />
    </div>

</template>
<style scoped>
.label {
  position: absolute;
  left: 3px;
  top: 0;
  font-size: 10px;
}
.box {
  position: relative;
}


.clearance {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: 60px 60px 60px 59px;
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
.cleared {
    grid-column: 1;
    border-bottom: 1px dashed darkgrey;
    border-right: 1px dashed darkgrey;
}
.route {
    grid-column: 1 / span 2;
    border-bottom: 1px dashed darkgrey;
}
.altitude {
    grid-row: 3;
    grid-column: 1;
    border-bottom: 1px dashed darkgrey;
}
.expect {
    grid-row: 3;
    grid-column: 2;
    border-bottom: 1px dashed darkgrey;
}
.frequency{
    grid-row: 4;
    grid-column: 1;
    border-right: 1px dashed darkgrey;
}
.transponder{
    grid-row: 4;
    grid-column: 2;
}

</style>