<template>
    <div class="lost-procedure">
        <div class="c-item" v-for="(item, index) in cList" :key="index" :title="item.desc">
            <div class="c-word"><span class="c-letter">{{item.word.charAt(0)}}</span>{{item.word.substring(1)}}</div>
            <div class="c-icon"><font-awesome-icon :icon="item.icon" /></div>
        </div>
    </div>
</template>

<script setup lang="ts">
const cList = [
    { word: 'Transfer', icon: ['fas', 'share'], desc: 'Transfer the risk (e.g., ask for help, fly with a more experienced pilot)' },
    { word: 'Eliminate', icon: ['fas', 'ban'], desc: 'Eliminate the risk (e.g., cancel the flight, do not perform the maneuver)' },
    { word: 'Accept', icon: ['fas', 'check'], desc: 'Accept the risk (when the benefits outweigh the costs and risk is mitigated)' },
    { word: 'Mitigate', icon: ['fas', 'shield'], desc: 'Mitigate the risk (e.g., take extra fuel, wait for better weather)' }
]
</script>

<style scoped>
.lost-procedure {
    display: flex;
    flex-flow: column;
    gap: 4px;
    padding: 6px 8px;
    color: black;
}
.c-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #ddd;
    background-color: #fafafa;
    border-radius: 6px;
    padding: 4px 15px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.c-word {
    font-weight: 700;
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.c-letter {
    font-weight: 900;
    font-size: 1.3rem;
    color: #d32f2f;
}
.c-icon {
    text-align: center;
    font-size: 1.2rem;
    color: #555;
}
</style>
