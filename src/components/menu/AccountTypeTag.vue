<template>
    <div class="att">{{ accountType }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AccountType } from '../../model/AccounType';

const props = defineProps({
    type: { type: String, default: null},
})

const accountType = ref('')

onMounted( () => {
    console.log(props.type)
    switch(props.type) {
        case AccountType.instrument: accountType.value = 'Instrument'; break;
    }
})

</script>

<style scoped>
.att {
    display: flex;
    align-items: center;
    border-radius: 3px;
    background: darkblue;
    color: white;
    font-size: 10px;
    padding: 2px 5px;
    height: 15px;
}
</style>