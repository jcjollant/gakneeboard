<template>
    <div class="flightDebrief contentPage">
        <Header title="Flight Debrief" :page="true" :displayMode="false"
            @replace="emits('replace')"></Header>
        <div class="fdGrid">
            <div class="fdLine">
                <div class="fdIcons brb">
                    <font-awesome-icon icon="fa-regular fa-face-smile" style="color: darkgreen;"/>
                    <font-awesome-icon icon="fa-regular fa-face-meh" style="color: darkgrey;"/>
                    <font-awesome-icon icon="fa-regular fa-face-frown" style="color: red;" />
                </div>
                <div>Notes</div>
            </div>
            <div v-for="index in 25" class="fdLine">
                <div class="fdSpacers brb">
                    <div class="br">&nbsp;</div>
                    <div class="br">&nbsp;</div>
                    <div>&nbsp;</div>
                </div>  
                <div class="category">{{ index <= categories.length ? categories[index - 1] : '' }}</div>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>

import { ref } from 'vue';
import Header from '../shared/Header.vue';

const categories = ref([])
const emits = defineEmits(['replace']);

</script>
<style scoped>
.fdGrid {
    display: flex;
    flex-direction: column;
}
.fdLine {
    display: grid;
    grid-template-columns: 1fr 4fr;
    border-bottom: 2px dashed lightgrey;
    height: 30px;
}
.fdIcons {
    display: flex;
    justify-content: space-around;
    align-items: center;
}
.brb {
    border-right: 1px solid black;
}
.fdSpacers {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}
.br {
    border-right: 1px solid darkgrey;
}
.category {
    padding-left: 10px;
    text-align: left;
}
</style>