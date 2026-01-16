<template>
    <div class="ty">
        <div class="confirm">
            <FAButton label="Home Page" icon="plane-departure" @click="router.push('/')"/>
        </div>
    </div>
</template>
<script setup lang="ts">
import FAButton from '../components/shared/FAButton.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>


<style scoped>
.ty {
    position: relative;
    min-height: 100vh;
    background: url('/ThankYou.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
}
.confirm {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 10px;
    width: 100%;
}
</style>