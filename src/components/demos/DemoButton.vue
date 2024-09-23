<script setup>

const props = defineProps({
  template: { type: Object, default: null},
  icon: {type: String, default: 'plane-departure'}
})

function getName(template) {
    if(!template || !template.name) return '?'
    if( !template.name.endsWith(' Demo')) return template.name
    return template.name.substring( 0, template.name.length - 5)
}

</script>
<template>
    <div class="demoButton" :title="template.desc">
        <font-awesome-icon class="icon" :icon="['fas',icon]" />
        <div>{{ getName(template) }}</div>
    </div>
</template>
<style scoped>
.demoButton {
    cursor: pointer;
    display: flex;
    flex-flow: column;
    gap: 5px;
    align-items: center;
    color: white;
    background-color: #2196f3;
    border-radius: 3px;
    padding: 10px 15px;
}
.icon {
    font-size: xx-large;
}
</style>