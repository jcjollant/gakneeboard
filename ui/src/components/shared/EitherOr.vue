<template>
    <div class="eitheror" :class="{'embedded': embedded, 'small': small}">
        <template v-if="!embedded">
            <span class="text choiceEither" :class="{'selected':model,'small':small}" @click="model=true">{{either}}</span>
            <div class="casing" :class="{'small':small}" @click="toggle">
                <div class="ball transform transition-transform duration-300" :class="{'right':!model, 'small':small}"></div>
            </div>
            <span class="text choiceOr" :class="{'selected':!model,'small':small}" @click="model=false">{{or}}</span>
        </template>
        <div v-else class="casing embedded" @click="toggle">
            <div class="ball transform transition-transform duration-300" :class="{'right':!model, 'small':small}"></div>
            <div class="labels-container">
                <span class="text choiceEither" :class="{'selected':model,'small':small}">{{either}}</span>
                <span class="text choiceOr" :class="{'selected':!model,'small':small}">{{or}}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">

const model = defineModel<boolean>()
const props = defineProps({
    either: {type: String, required: true},
    or: {type: String, required: true},
    small: {type: Boolean, default: true},
    embedded: {type: Boolean, default: false}
})

function toggle() {
    model.value = !model.value
}

</script>

<style scoped>
.eitheror {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    /* justify-content: center;*/
    align-items: center; 
}
.eitheror.small {
    font-size: 0.7rem;
    gap: 0.5rem;
}

.eitheror.embedded {
    display: block;
    grid-template-columns: none;
    width: fit-content;
}

.casing {
    display: flex;
    width: 3.5rem;
    height: 2rem;
    padding: 0.25rem;
    cursor: pointer;
    border-radius: 9999px;
    background-color: lightgrey;
    position: relative;
    /* box-shadow: 2px 2px rgba(0, 0, 0, 0.2) inset; */
}
.casing.small {
    width: 3rem;
    height: 1.5rem;
    padding: 0.2rem;
}

.casing.embedded {
    width: fit-content;
    height: 1.7rem;
    padding: 2px;
    overflow: hidden;
    background-color: #e5e7eb;
    border: 1px solid #d1d5db;
    display: flex;
    align-items: center;
    border-radius: 6px;
    position: relative;
}

.casing.embedded.small {
    height: 1.3rem;
    padding: 1px;
}

.ball {
    width: 1.5rem;
    height: 1.5rem;
    background-color: white;
    border-radius: 9999px;
    transition: transform 0.3s ease;
    box-shadow: 2px 2px rgba(0, 0, 0, 0.1);
    z-index: 2;
}
.ball.small {
    width: 1.1rem;
    height: 1.1rem;
}

.casing.embedded .ball {
    width: calc(50% - 2px);
    height: calc(100% - 4px);
    border-radius: 4px;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);
    position: absolute;
    top: 2px;
    left: 2px;
    z-index: 1;
}

.casing.embedded.small .ball {
    width: calc(50% - 1px);
    height: calc(100% - 2px);
    top: 1px;
    left: 1px;
    border-radius: 3px;
}

.right {
    transform: translateX(1.5rem); 
}

.casing.small .right {
    transform: translateX(1.5rem);
}

.casing.embedded .right {
    transform: translateX(100%);
}

.labels-container {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 3;
    pointer-events: none;
}

.text{
    font-size: .875rem;
    line-height: 1.25rem;
    padding: 0 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.casing.embedded .text {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px; /* Add horizontal padding to drive width */
    min-width: 50px; /* Ensure a minimum clickable area */
    white-space: nowrap; /* Prevent wrapping */
    font-weight: 500;
    color: #6b7280;
    font-size: 0.8rem;
}

.casing.embedded.small .text {
    padding: 0 8px;
    min-width: 40px;
}

.casing.embedded .text.selected {
    color: #111827;
    font-weight: 600;
}

.text.small{
    font-size: 0.7rem;
    line-height: 1rem;
}
.selected {
    font-weight: 600;    
}

</style>