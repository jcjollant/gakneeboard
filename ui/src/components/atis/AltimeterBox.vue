<template>
    <div class="altimeter">
        <div v-if="showTitle" class="tileBoxLabel">Alt</div>
        <div class="wtrmrk">
            <div>28</div>
            <div>29</div>
            <div>30</div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    showTitle: { type: Boolean, default: true }
})
</script>

<style scoped>
.altimeter {
    position: relative;
}

.wtrmrk {
    position: absolute;
    display: flex;
    bottom: 0;
    justify-content: space-between;
    width: 100%;
    padding: 2px 4px;
}
</style>
