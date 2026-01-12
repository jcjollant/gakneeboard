<template>
    <div class="separator" :class="{ 'level-1': level === 1 }">{{ name }}</div>
</template>

<script setup>
defineProps({
    name: String,
    level: {
        type: Number,
        default: 0
    }
})
</script>

<style scoped>
.separator {
    display: flex;
    color: var(--bg-secondary);
    font-weight: bold;
    gap: 10px;

    &:before,
    &:after {
        content: "";
        flex: 1;
        height: 1px;
        margin: 0 3px;
        background: var(--bg-secondary);
    }

    align-items: center;
    padding-top: 5px;
    margin: 0;

}

.separator.level-1 {
    font-size: 0.8em;
    color: darkgrey;
}

.separator.level-1:before,
.separator.level-1:after {
    background: darkgrey;
}
</style>