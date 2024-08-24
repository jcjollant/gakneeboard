<script setup>
import { ref } from 'vue'

import { getMaintenance } from '../../assets/data'
import { getToastData, getToastError } from '../../assets/toast'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext'

const emits = defineEmits(['maintenance', 'toast'])

const code = ref('')

function onSubmit() {
    getMaintenance(code.value).then( () => {
        emits('toast', getToastData('Maintenance', 'Operation succeeded'))
        emits('maintenance')
    }).catch( e =>{
        emits('toast', getToastError('Maintenance', 'Operation failed'))
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
