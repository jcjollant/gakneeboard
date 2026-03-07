<template>
    <div class="compact" :class="{ 'solid-left-border': borderLeft }">
        <div class="info br" :class="{ bb: borderBottom }">
            <div class="tileBoxLabel">Info</div>
        </div>
        <div class="wind br" :class="{ bb: borderBottom }">
            <div class="tileBoxLabel">Wind</div>
            <span class="at">@</span>
            <div class="wtrmrk gust">G</div>
        </div>
        <div class="altimeter br" :class="{ bb: borderBottom }">
            <div class="tileBoxLabel">Alt</div>
        </div>
        <div class="runway" :class="{ bb: borderBottom }">
            <div class="tileBoxLabel">Rwy</div>
        </div>
    </div>
</template>

<script setup lang="ts">
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

.info, .wind, .altimeter, .runway {
    position: relative;
}
</style>
