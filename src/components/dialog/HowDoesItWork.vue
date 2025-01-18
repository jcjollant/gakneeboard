<script setup>

import Button from 'primevue/button'
import Dialog from 'primevue/dialog';

const emits = defineEmits(["close"]);

</script>
<template>
    <Dialog modal header="Create Your Kneeboard">
        <div class="hdiw">
            <div class="item">
                <font-awesome-icon class="icon" :icon="['fas','plane-departure']" />
                <span>Airports</span>
            </div>
            <div class="item">
                <font-awesome-icon class="icon" :icon="['fas','list-check']" />
                <span>Checklist</span>
            </div>
            <div class="item">
                <font-awesome-icon class="icon" :icon="['fas','route']" />
                <span>Navlog</span>
            </div>
        </div>
        <div class="intro">Your own perfect Kneeboard in minutes:</div>
        <div class="detailed-content">
        <ol>
            <li>Click on tiles to match your preferences</li>
            <li>Print on Letter size paper</li>
            <li>Slap on your kneeboard and go flying!</li>
        </ol>
        </div>
        <div class="actionDialog"><Button label="Got it" @click="emits('close')"></Button></div>
    </Dialog>
</template>

<style scoped>
.hdiw {
    display: flex;
    flex-flow: row;
    justify-content: space-around;
    width: 35rem;
    font-size: 1.5rem;
    margin: 1rem 0 2rem 0;
    text-align: center;
}

.icon {
    font-size: 4rem;
    margin-bottom: 1rem;
}

.intro {
    width: 35rem;
}

.item {
    display: flex;
    flex-flow: column;
}

.detailed-content {
  display: flex;
  flex-flow: column;
}

</style>
