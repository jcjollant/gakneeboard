<template>
    <div class="updateButton" aria-label="Update" :title="manage?'Manage Account':'Upgrade Account'" :class="{'manage':manage}">
        <!-- <font-awesome-icon icon="['fas','arrow-up']" /> -->
        <div>{{manage?'Manage':'Upgrade'}}</div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    manage: {
        type: Boolean,
        required: false
    }
})
</script>

<style scoped>
.updateButton {
    cursor: pointer;
    color: black;
    background-color: orange;
    border-radius: 3px;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    font-family: var(--font-family);
    transition-duration: 0.2s;
    padding: 4px 10px;
}
.manage {
    background-color: blue;
    color: white;
}
</style>