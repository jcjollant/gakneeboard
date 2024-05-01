<script setup>
import Title from './Header.vue';

const emits = defineEmits(['replace'])

</script>
<template>
    <div class="widget">
        <Title :title="'ATIS'" :info="true" @click="emits('replace')"/>
        <div class="content atis">
            <div class="info">
                <div class="label">Info</div>
            </div>
            <div class="wind">
                <div class="label">Wind</div>
            </div>
            <div class="runway">
                <div class="label">Rwy</div>
            </div>
            <div class="visibility">
                <div class="label">Vis</div>
            </div>
            <div class="sky">
                <div class="label">Sky</div>
            </div>
            <div class="temperature">
                <div class="label">Temp</div>
            </div>
            <div class="altitude">
                <div class="label">Alt</div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.label {
  position: absolute;
  left: 3px;
  top: 0;
  font-size: 10px;
}
.atis {
    display: grid;
    grid-template-columns: 20% 30% 25% 25%;
}
.info {
    grid-column: 1;
    position: relative;
    border-right: 1px dashed darkgrey;
}
.wind {
    grid-column: 2 / span 2;
    position: relative;
    border-right: 1px dashed darkgrey;
}
.runway {
    grid-column: 4;
    position: relative;
}
.sky {
    grid-column: 3 / span 2;
    grid-row: 2 / span 3;
    position: relative;
    border-top: 1px dashed darkgrey;
    border-left: 1px dashed darkgrey;
}
.visibility {
    grid-row: 2;
    grid-column: 1 / span 2;
    position: relative;
    border-top: 1px dashed darkgrey;
    border-bottom: 1px dashed darkgrey;
}
.temperature {
    grid-row: 3;
    grid-column: 1 / span 2;
    position: relative;
    border-bottom: 1px dashed darkgrey;
}
.altitude {
    grid-row: 4;
    grid-column: 1 / span 2;
    position: relative;
}
</style>