<template>
    <div class="att">{{ accountType }}</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AccountType, parseAccountType } from '../../model/AccounType';
import { Formatter } from '../../lib/Formatter';

const props = defineProps({
    type: { type: String, default: null},
})

const accountType = ref('')

onMounted( () => {
    console.log(props.type)
    accountType.value = Formatter.accountType( parseAccountType( props.type))
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