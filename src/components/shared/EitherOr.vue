<template>
    <div class="eitheror">
        <span class="text" :class="{'selected':model}">Monthly</span>
        <div class="casing" @click="toggle">
            <div class="ball transform transition-transform duration-300 translate-x-6" :class="{'right':!model}"></div>
        </div>
        <span class="text" :class="{'selected':!model}">Annual</span>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const model = defineModel()

function toggle() {
    model.value = !model.value
}

</script>

<style scoped>
.eitheror {
    display: flex;
    justify-content: center;
    align-items: center;
}
.casing {
    display: flex;
    width: 3.5rem;
    height: 2rem;
    padding: 0.25rem;
    cursor: pointer;
    border-radius: 9999px;
    background-color: lightgrey;
    /* box-shadow: 2px 2px rgba(0, 0, 0, 0.2) inset; */
}
.ball {
    width: 1.5rem;
    height: 1.5rem;
    background-color: white;
    border-radius: 9999px;
    transition: transform 0.5s ease;
    /* transition-duration: 0.5s; */
    box-shadow: 2px 2px rgba(0, 0, 0, 0.2);
}
.right {
    transform: translateX(1.5rem); 
    /* translate: 1.5rem; */
}
.text{
    font-size: .875rem;
    line-height: 1.25rem;
    padding: 0 1rem;
}
.selected {
    font-weight: 600;    
}
</style>