<script setup>
import { ref } from 'vue'

import { getMaintenance } from '@/assets/data'
import { useToast } from 'primevue/usetoast';
import { useToaster } from '@/assets/Toaster';

import Button from 'primevue/button'
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext'

const emits = defineEmits(['close'])
const toaster = useToaster(useToast())
const code = ref('')

function onSubmit() {
    getMaintenance(code.value).then( () => {
        toaster.success('Maintenance', 'Operation succeeded')
        emits('close')
    }).catch( e =>{
        toaster.error('Maintenance', 'Operation failed')
    })
}

</script>


<template>
    <Dialog modal header="Maintenance" class="maintenanceDialog">
        <div>
            <InputText placeholder="Code" v-model="code"></InputText>
            <Button label="Submit" @click="onSubmit"></Button>
        </div>
    </Dialog>
</template>

<style scoped>
.maintenanceDialog {
    display: flex;
    flex-flow: row;
    justify-content: space-around;
    width: 500px;
    font-size: 1.5rem;
    margin: 1rem 0 2rem 0;
    text-align: center;
}

</style>
