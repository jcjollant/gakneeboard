<template>
    <div class="grid">
        <div class="col-6">
            <h3>Forward CG Limits</h3>
            <DataTable :value="fwdLimits" responsiveLayout="scroll">
                <Column field="posInch" header="Arm (in)">
                    <template #body="{ index }">
                        <InputNumber v-model="fwdLimits[index].posInch" :minFractionDigits="2" />
                    </template>
                </Column>
                <Column field="weightLbs" header="Weight (lbs)">
                    <template #body="{ index }">
                        <InputNumber v-model="fwdLimits[index].weightLbs" />
                    </template>
                </Column>
                <Column headerStyle="width: 4rem">
                    <template #body="{ index }">
                        <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeLimit('fwd', index)" />
                    </template>
                </Column>
            </DataTable>
            <Button label="Add Limit" icon="pi pi-plus" class="p-button-text mt-2" @click="addLimit('fwd')" />
        </div>

        <div class="col-6">
            <h3>Aft CG Limits</h3>
            <DataTable :value="aftLimits" responsiveLayout="scroll">
                <Column field="posInch" header="Arm (in)">
                    <template #body="{ index }">
                        <InputNumber v-model="aftLimits[index].posInch" :minFractionDigits="2" />
                    </template>
                </Column>
                <Column field="weightLbs" header="Weight (lbs)">
                    <template #body="{ index }">
                        <InputNumber v-model="aftLimits[index].weightLbs" />
                    </template>
                </Column>
                <Column headerStyle="width: 4rem">
                    <template #body="{ index }">
                        <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeLimit('aft', index)" />
                    </template>
                </Column>
            </DataTable>
            <Button label="Add Limit" icon="pi pi-plus" class="p-button-text mt-2" @click="addLimit('aft')" />
        </div>
    </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { CgLimit } from '@gak/shared'

const props = defineProps<{
    fwdLimits: CgLimit[]
    aftLimits: CgLimit[]
}>()

function addLimit(type: 'fwd' | 'aft') {
    const limits = type === 'fwd' ? props.fwdLimits : props.aftLimits
    limits.push({ posInch: 0, weightLbs: 0 })
}

function removeLimit(type: 'fwd' | 'aft', index: number) {
    const limits = type === 'fwd' ? props.fwdLimits : props.aftLimits
    limits.splice(index, 1)
}
</script>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
}
.col-6 {
    grid-column: span 6;
}
@media (max-width: 768px) {
    .col-6 {
        grid-column: span 12;
    }
}
</style>
