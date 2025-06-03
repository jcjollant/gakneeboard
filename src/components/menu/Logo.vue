<template>
    <div class="logo" :class="{'template-loaded': hasTemplate}">
        <img src="/favicon.png" class="logo-img" alt="GA Kneeboard">
        <div class="logo-name">GA Kneeboard</div>
        <div class="logo-beta">BETA</div>
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
    justify-content: center;
    cursor: pointer;
    color: #444;
}
.logo:hover {
    color: black;
}
.logo-img {
    width: 30px;
    height: 30px;
}
.logo-name {
    font-size: var(--logo-font-size);
    font-weight: bold;
    padding-left: 10px;
    line-height: 30px;
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
