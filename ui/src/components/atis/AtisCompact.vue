<template>
    <div class="compact" :class="{ 'solid-left-border': borderLeft }">
        <TitleBox title="Info" class="br" :class="{ bb: borderBottom }" />
        <WindBox class="br"  :class="{ bb: borderBottom }"/>
        <AltimeterBox class="br" :class="{ bb: borderBottom }" />
        <TitleBox title="Rwy" class="br" :class="{ bb: borderBottom }" />
    </div>
</template>

<script setup lang="ts">
import WindBox from './WindBox.vue';
import AltimeterBox from './AltimeterBox.vue';
import TitleBox from '../shared/TitleBox.vue';


defineProps({
    borderBottom: { type: Boolean, default: false },
    borderLeft: { type: Boolean, default: false }
})
</script>

<style scoped>
.compact {
    display: grid;
    grid-template-columns: 15% 40% 25% 20%;
}
.solid-left-border {
    border-left: 1px solid #444;
}
.wtrmrk {
    position: absolute;
    display: flex;
    bottom: 0;
    justify-content: space-between;
    width: 100%;
    padding: 2px 4px;
}
.gust {
    right: 0;
    width: 49px;
    opacity: 0.2;
}
.at {
    position: absolute;
    left: 50px;
    top: 20px;
    font-size: 0.8rem;
    color: darkgrey;
}

.info, .wind, .runway {
    position: relative;
}
</style>
