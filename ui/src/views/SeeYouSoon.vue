<template>
    <div class="see-you-soon">
        <h1>Blue Skies!</h1>
        <div class="message">
            <p>You have been signed out.</p>
            <p>Redirecting to home...</p>
            <button @click="goHome">Go to Home now</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

function goHome() {
    window.location.href = '/'
}

onMounted(() => {
    setTimeout(() => {
        goHome()
    }, 10000)
})
</script>

<style scoped>
.see-you-soon {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    background-image: url('/blue-skies.jpg');
    background-size: cover;
    background-position: center;
}

.message {
    padding: 2rem;
    border-radius: 8px;
    background-color: #f0f0f0;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: white;
    position: absolute;
    top: 2rem;
}

p {
    margin-bottom: 0.5rem;
    color: #666;
}

button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
}

button:hover {
    background-color: #0056b3;
}
</style>
