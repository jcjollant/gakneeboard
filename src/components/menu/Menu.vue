<template>
    <div class="menu">
        <div class="left">
            <Logo @click="router.push('/')" />
            <font-awesome-icon v-if="name" class="icon" icon="fa-chevron-right" />
            <div v-if="name" title="Active Template Name" class="templateName">{{name}}</div>
        </div>
    </div>
</template>

<script setup>
// import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Logo from './Logo.vue';

const emits = defineEmits(['about'])
const props = defineProps({
    name: String, default: null
})
const router = useRouter()


</script>

<style scoped>
.actions {
    display: flex;
    gap: 10px;
}
.icon {
    color: black;
}
.left {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--logo-font-size);
    font-weight: bold;
}
.menu {
    height: var(--menu-height);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    width: 100%;
    background-color: lightgrey;
}
.right {
    display: flex;
}
</style>