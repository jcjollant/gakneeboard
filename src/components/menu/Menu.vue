<template>
    <div class="menu">
        <div class="left">
            <router-link to="/">GA Kneeboard</router-link>
        </div>

        <div v-if="route.name=='Template'" class="actions">
            <!-- <router-link to="/print">Print</router-link> -->
            <FAButton icon="fa-print" label="Print" :menu="true" title="Export Template" @click="onPrint" />
            <FAButton icon="fa-circle-info" label="Save" :menu="true" title="Export Template"></FAButton>
            <!-- <div>Save</div> -->
            <FAButton icon="fa-file-export" label="Export" :menu="true" title="Export Template"></FAButton>
        </div>

        <div class="right">
            <FAButton icon="fa-circle-info" :menu="true"></FAButton>
            <div>Session</div>
        </div>
    </div>
</template>

<script setup>
// import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FAButton from '../shared/FAButton.vue';

const route = useRoute()
const router = useRouter()

const onPrint = () => router.push('/print')

</script>

<style scoped>
.actions {
    display: flex;
    gap: 10px;
}
.left {
    display: flex;
}
.menu {
    height: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    /* border: 1px solid red; */
    width: 100%;
    background-color: lightgrey;
}
.right {
    display: flex;
}
</style>