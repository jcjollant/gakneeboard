<template>
    <div class="oneChoice">
        <div v-for="c in choices" :aria-label="c.label" 
            @click="onChoice(c)" 
            class="choice" :class="{'choiceActive':(model.label==c.label),'choiceInactive':(model.label!=c.label)}"
            :title="c.title?c.title:null"
            >{{c.label}}</div>
    </div>
</template>

<script setup>

const props = defineProps({
  choices: { type: Object, default: [{label:'No Choice'}]},
})

const emits = defineEmits(["change"]);
const model = defineModel()

function onChoice(choice) {
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
    background-color: #b4c6e7;
}
</style>