<template>
    <div class="oneChoice" :class="{'full':full}">
        <button type="button" v-if="model" v-for="(c,index) in choices" :aria-label="c.label" 
            @click="onChoice(c)" 
            class="choice" 
            :class="[{'choiceActive':(model.label==c.label),'choiceInactive':(model.label!=c.label),'thinPad':thinpad}, `choice${index}`]"
            :title="c.title || c.description || undefined">
            <slot :choice="c">
                <font-awesome-icon v-if="c.label && c.label.startsWith('fa-')" :icon="c.label" />
                <span v-else>{{c.label}}</span>
            </slot>
        </button>
        <div v-else>Model Missing</div>
    </div>
</template>

<script setup lang="ts">

const props = defineProps({
  choices: { type: Array<any>, default: []},
  thinpad: { type: Boolean, default: false },
  full: { type: Boolean, default: false },
})


const emits = defineEmits(["change"]);
const model = defineModel<any>()

function onChoice(choice:any) {
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