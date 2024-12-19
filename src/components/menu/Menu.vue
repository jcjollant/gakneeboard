<template>
    <div class="menu">
        <div class="left">
            <Logo @click="router.push('/')" />
            <font-awesome-icon v-if="name" class="icon" icon="fa-chevron-right" />
            <div v-if="name" title="Active Template Name">{{name}}</div>
        </div>

        <div v-if="route.name=='Template'" class="actions">
            <FAButton icon="fa-print" label="Print" :menu="true" title="Export Template" @click="onPrint" />
            <FAButton icon="fa-circle-info" label="Save" :menu="true" title="Export Template"></FAButton>
            <FAButton icon="fa-file-export" label="Export" :menu="true" title="Export Template"></FAButton>
        </div>

        <div class="right">
            <!-- <FAButton icon="fa-circle-info" :menu="true" @click="router.push('/about')" title="About GA Kneeboard"></FAButton> -->
            <Session />
        </div>
    </div>
</template>

<script setup>
// import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FAButton from '../shared/FAButton.vue';
import Logo from './Logo.vue';
import Session from './Session.vue';

const emits = defineEmits(['about'])
const props = defineProps({
    name: String, default: null
})
const route = useRoute()
const router = useRouter()


const onPrint = () => router.push('/print')

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
    height: 2rem;
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