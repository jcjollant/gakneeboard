<template>
    <div class="stripContent notes">
        <div class="stripBox box">&nbsp;</div>
        <StripActions @action="emits('action', $event)" />
    </div>
</template>

<script setup lang="ts">
import StripActions from '../strips/StripActions.vue'; 

const emits = defineEmits(['action']);
</script>

<style scoped>
.notes {
    /* opacity: 0.3; */
    border-radius: 5px;
    /* background: white ; */
    border: none;
}
.box {
    height: 100px;
}

</style>