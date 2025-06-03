<template>
    <div class="menu" >
        <div class="left">
            <Logo :hasTemplate="!!name" @click="router.push('/')" />
            <font-awesome-icon v-if="name" class="icon" icon="fa-chevron-right" />
            <div v-if="name" title="Active Template Name" class="templateName">{{name}}</div>
            <div v-if="test" class="test">Test Backend</div>
        </div>
        <div class="right" @click="router.push('/plans')">
            Plans
        </div>
    </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue'
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router'
import { GApiUrl } from '../../lib/GApiUrl';
import Logo from './Logo.vue';

const emits = defineEmits(['about'])
const props = defineProps({
    name: String, default: null
})
const router = useRouter()
const test = ref(false)

onMounted(() => {
    test.value = GApiUrl.isTest()
    // console.log('[Menu.onMounted]')
})

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
.templateName {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 300px;
}
.test {
    border-radius: 5px;;
    font-size: 0.8rem;
    font-weight: 500;
    padding: 2px 5px;
    color: white;
    background-color: red;
}
.right {
    display: flex;
    padding-right: 100px;
    cursor: pointer;
    color: #666;
    padding: 4px 10px;
    margin-right: 100px;
}

.right:hover {
    color: white;
    border-radius: 4px;;
    background-color: var(--bg);
}

/* Adjust template name display on narrow screens */
@media (max-width: 768px) {
    .templateName {
        max-width: 200px;
    }
    
    .right {
        display: none;
    }
}
</style>
