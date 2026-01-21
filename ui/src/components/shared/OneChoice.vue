<template>
    <div class="oneChoice" :class="{'full':full}">
        <button type="button" v-if="model" v-for="(c,index) in choices" :aria-label="c.label" 
            @click="onChoice(c)" 
            class="choice" 
            :class="[{'choiceActive':(model.label==c.label),'choiceInactive':(model.label!=c.label),'thinPad':thinpad}, `choice${index}`]"
            :title="c.title??undefined">
            <font-awesome-icon v-if="c.label.startsWith('fa-')" :icon="c.label" />
            <span v-else>{{c.label}}</span>
        </button>
        <div v-else>Model Missing</div>
    </div>
</template>

<script setup lang="ts">
import { OneChoiceValue } from '../../models/OneChoiceValue';


const props = defineProps({
  choices: { type: Array<OneChoiceValue>, default: []},
  thinpad: { type: Boolean, default: false },
  full: { type: Boolean, default: false },
})


const emits = defineEmits(["change"]);
const model = defineModel<OneChoiceValue>()

function onChoice(choice:OneChoiceValue) {
    // console.log('[OneChoice.onChouce]', choice)
    model.value = choice
    emits('change')
}
</script>

<style scoped>
.oneChoice {
    display:flex;
    border-radius: 3px;
    border: 1px solid lightgrey;
    justify-content: center;
    cursor: pointer;
    width: fit-content;
    line-height: 1.5rem;
    flex-wrap: wrap;
}

.oneChoice.full {
    width: 100%;
}

.choice {
    padding: 7px 14px;
    flex: 1 1 auto;
    line-height: 1.5rem;
    text-align: center;
    border: none;
    background: none;
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
}

.choiceInactive:hover {
    background-color: #eee;
}

.choiceActive {
    background-color: var(--bg-choice-active);
}

.thinPad {
    padding: 3px 7px;
}
</style>