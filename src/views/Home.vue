<template>
    <div class="home">
        <div class="section">
            <div class="header">Templates</div>
            <div class="sectionContent">
                <PlaceHolder title="No Templates (yet)" subtitle="Your Templates will show here"/>
                <div>{{ user.templates.length }}</div>
                <!-- <router-link to="/template/1">Template 1</router-link> -->
            </div>
        </div>
        <div class="section">
            <div class="header">Demos</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PlaceHolder from '../components/shared/PlaceHolder.vue';
import { newCurrentUser } from '../assets/data';
import { CurrentUser } from '../assets/CurrentUser';

const user = ref(new CurrentUser())

onMounted( () => {
  user.value = newCurrentUser
})
</script>

<style scoped>
.header {
    border-bottom: 1px dashed lightgrey;
    font-weight: bolder;
    text-align: left;
    padding-top: 10px;
    padding-left: 20px;
    padding-bottom: 5px;
}
.home {
    display: flex;
    flex-flow: column;
    gap: 10px;
    padding: 5px;;
}
.section {
    border: 3px solid lightgrey;
    border-radius: 10px;
    flex-grow: 1;
}
</style>