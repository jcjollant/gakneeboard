<template>
    <div class="decide-procedure">
        <div class="d-item" v-for="(item, index) in cList" :key="index" :title="item.desc">
            <div class="d-word"><span class="d-letter">{{item.word.substring(0,1)}}</span>{{item.word.substring(1)}}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
const cList = [
    { word: 'Detect change', icon: ['fas', 'magnifying-glass'], desc: 'Detect the fact that a change has occurred' },
    { word: 'Estimate need', icon: ['fas', 'scale-unbalanced'], desc: 'Estimate the need to counter or react to the change' },
    { word: 'Choose outcome', icon: ['fas', 'code-branch'], desc: 'Choose a desirable outcome for the success of the flight' },
    { word: 'Identify actions', icon: ['fas', 'bullseye'], desc: 'Identify actions which could successfully control the change' },
    { word: 'Do action', icon: ['fas', 'person-running'], desc: 'Do the necessary action to adapt to the change' },
    { word: 'Evaluate effect', icon: ['fas', 'check-to-slot'], desc: 'Evaluate the effect of the action' }
]
</script>

<style scoped>
.decide-procedure {
    display: flex;
    flex-flow: column;
    gap: 4px;
    padding: 6px 8px;
    color: black;
    height: var(--tile-content-height);
    box-sizing: border-box;
}
.d-item {
    display: flex;
    justify-content: flex-start;
    border: 1px solid #ddd;
    background-color: #fafafa;
    border-radius: 6px;
    padding: 4px 15px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.5);
    flex: 1;
}
.d-word {
    font-weight: 700;
    font-size: 1.05rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.d-letter {
    font-weight: 900;
    font-size: 1.3rem;
    color: #d32f2f;
}
.d-icon {
    text-align: center;
    font-size: 1.2rem;
    color: #555;
    width: 24px;
}
</style>
