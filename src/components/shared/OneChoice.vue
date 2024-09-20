<script setup>
const props = defineProps({
  choices: { type: Object, default: [{label:'No Choice'}]},
})

const emits = defineEmits(["change"]);

const model = defineModel()
function onChoice(choice) {
    model.value = choice
    emits('change')
}
</script>
<template>
    <div class="oneChoice">
        <div v-for="c in choices" 
            @click="onChoice(c)" 
            class="choice" :class="{'choiceActive':(model.label==c.label),'choiceInactive':(model.label!=c.label)}"
            >{{c.label}}</div>
    </div>
</template>
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