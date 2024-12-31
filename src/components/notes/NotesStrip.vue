<template>
    <div class="stripContent notes">
        <div class="stripBox box">&nbsp;</div>
        <StripActions v-if="edit" @action="emits('action', $event)" />
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import StripActions from '../strips/StripActions.vue'; 

const emits = defineEmits(['action']);
const edit = ref(false)
const props = defineProps({
    edit: { type: Boolean, required: false, default: false }
})

onMounted(() => {
    edit.value = props.edit
})
watch(props, () => {
    edit.value = props.edit
})
</script>

<style scoped>
.notes {
    position: relative;
    /* opacity: 0.3; */
    border-radius: 5px;
    /* background: white ; */
    border: none;
}
.box {
    height: 100px;
}

</style>