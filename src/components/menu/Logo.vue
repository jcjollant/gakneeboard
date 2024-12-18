<template>
    <div class="logo">
        <img src="/favicon.png" class="logo-img" alt="GA Kneeboard">
        <div class="logo-name">GA Kneeboard</div>
    </div>
</template>

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
</style>