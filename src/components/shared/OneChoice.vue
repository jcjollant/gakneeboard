<template>
    <div class="oneChoice">
        <div v-if="model" v-for="(c,index) in choices" :aria-label="c.label" 
            @click="onChoice(c)" 
            class="choice" :class="[{'choiceActive':(model.label==c.label),'choiceInactive':(model.label!=c.label),'thinPad':thinpad}, `choice${index}`]"
            :title="c.title??undefined">
            <font-awesome-icon v-if="c.label.startsWith('fa-')" :icon="c.label" />
            <span v-else>{{c.label}}</span>
        </div>
        <div v-else>Model Missing</div>
    </div>
</template>

<script setup lang="ts">
import { OneChoiceValue } from '../../models/OneChoiceValue';


const props = defineProps({
  choices: { type: Array<OneChoiceValue>, default: []},
  thinpad: { type: Boolean, default: false },
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
}

.choice {
    padding: 7px 14px;
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