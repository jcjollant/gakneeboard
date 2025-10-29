<template>
    <div class="logo" :class="{'template-loaded': hasTemplate}">
        <img src="/favicon.png" class="logo-img" alt="GA Kneeboard">
        <div class="logo-name">GA Kneeboard</div>
    </div>
</template>

<script setup>
defineProps({
    hasTemplate: Boolean
});
</script>

<style scoped>
.logo {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #1e3a8a;
    font-size: 1.5rem;
    font-weight: bold;
    gap: 0.5rem;
}
.logo:hover {
    color: #1e3a8a;
}
.logo-img {
    width: 30px;
    height: 30px;
}
.logo-name {
    font-size: inherit;
    font-weight: inherit;
    color: inherit;
}
.logo-beta {
    font-size: calc(var(--logo-font-size) / 2);
    font-weight: bold;
    height: 25px;
    color: #777;
}

/* Hide the logo text and beta label on narrow screens only when a template is loaded */
@media (max-width: 768px) {
    .template-loaded .logo-name, 
    .template-loaded .logo-beta {
        display: none;
    }
}
</style>
