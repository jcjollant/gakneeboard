<template>

    <div class="stripContent">
        <div class="stripHeader">Add Strip</div>
        <div class="list">
            <Button v-for="s in strips" :label="s.name" @click="emits('selection', s.type)"></Button>

        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { StripType } from '../../assets/StripType'
import Button from 'primevue/button'

const emits = defineEmits(['selection'])
const strips = ref([
    {name: 'ATIS', type: StripType.atis},
    {name: 'Taxi', type: StripType.taxi},
    {name: 'Notes', type: StripType.notes},
])
</script>

<style scoped>
.list {
    display: flex;
    gap: 10px;
    justify-content: center;
    padding: 5px;
}
</style>