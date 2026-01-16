<template>
    <div class="tile">
        <Header title="Corner Selection" :clickable="false" />
        <div class="mockTileContent">
            <Button label="1" class="top left button" :severity="model==0 ? 'primary' : 'secondary'" @click="model = 0"></Button>
            <Button label="2" class="top right button" :severity="model==1 ? 'primary' : 'secondary'" @click="model = 1"></Button>
            <Button label="3" class="bottom left button" :severity="model==2 ? 'primary' : 'secondary'" @click="model = 2"></Button>
            <Button label="4" class="bottom right button" :severity="model==3 ? 'primary' : 'secondary'" @click="model = 3"></Button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Button from 'primevue/button'
import Header from '../shared/Header.vue';

const model = defineModel<Number>();
</script>

<style scoped>
.mockTileContent {
    position: relative;
    margin: 10px;
    height: var(--tile-content-height);
}
.button {
    position: absolute;
}
.top {
    top: 0;
}
.bottom {
    bottom: 20px;
}
.left {
    left: 0;
}
.right {
    right: 0;
}
</style>