<template>
    <div class="distress-call">
        <div class="d-item" v-for="(item, index) in dList" :key="index">
            <div class="d-content">
                <div class="d-label">{{item.label}}</div>
            </div>
            <div class="d-icon"><font-awesome-icon :icon="item.icon" /></div>
        </div>
    </div>
</template>

<script setup lang="ts">
const dList = [
    { label: 'ELT Status', icon: ['fas', 'tower-broadcast'] },
    { label: 'Visible Landmarks', icon: ['fas', 'mountain-sun'] },
    { label: 'Aircraft Color', icon: ['fas', 'palette'] },
    { label: 'Souls Onboard', icon: ['fas', 'users'] },
    { label: 'Emergency Equip.', icon: ['fas', 'suitcase-medical'] }
]
</script>

<style scoped>
.distress-call {
    display: flex;
    flex-flow: column;
    gap: 6px;
    padding: 10px 12px;
    color: black;
    height: var(--tile-content-height);
    box-sizing: border-box;
}
.d-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #ddd;
    background-color: #fafafa;
    border-radius: 6px;
    padding: 0 15px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.5);
    flex: 1;
}
.d-icon {
    text-align: center;
    font-size: 1rem;
    color: #555;
}
.d-label {
    font-weight: 700;
    font-size: 0.8rem;
    text-align: left;
    text-transform: uppercase;
}
</style>
