<template>
    <Dialog modal header="Welcome to GA Kneeboard" style="width: 600px">
        <p class="mb-1">Please read and accept our updated <a :href="UserUrl.eula" target="_blank">End User License Agreement</a> to continue. </p>
        <p class="highlight"><b>What matters the most</b><br/>
        Always verify critical flight information from official sources before flight operations. Never rely solely on this software for flight-critical decisions.
        </p>
        <Checkbox v-model="accepted" :value="true" inputId="eula" />
        <label for="eula" class="ml-2">I have read and understand the End User License Agreement and agree to be bound by its terms and conditions.</label>
        <div class="actionDialog gap-2">
            <Button label="Continue" @click="onContinue" :disabled="!accepted"></Button>
        </div>
    </Dialog>
</template>


<script setup lang="ts">
import { currentUser, postEula } from '../../assets/data';
import { useRouter } from 'vue-router';
import { onMounted, ref } from 'vue';
import { UserUrl } from '../../lib/UserUrl.ts'
import { useToaster } from '../../assets/Toaster';
import { useToast } from 'primevue/usetoast';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';

const accepted = ref(false)
const overage = ref<String[]>([])
const emits = defineEmits(['close'])
const router = useRouter()
const toaster = useToaster( useToast())

onMounted( () => {
    const overTemplate = currentUser.templates.length - currentUser.maxTemplateCount
    const overPage = currentUser.pageCount - currentUser.maxPageCount
    if (overTemplate > 0) {
        overage.value.push( overTemplate + ' template' + (overTemplate > 1 ? 's' : '') )
    }
    if (overPage > 0) {
        overage.value.push( overPage + ' page'  + (overPage > 1 ? 's' : '') )
    }
})

function onContinue() {
    postEula().then( () => {
        toaster.success('EULA accepted', "Thank you")
    })
    emits('close')
}

</script>

<style scoped>
p {
    line-height: 1.5rem;
}
.highlight {
    background-color: lightyellow;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid darkorange
}
</style>
