<template>
    <Dialog modal :header="'Hey ' + currentUser.name + ', a personal note to you'" style="width: 600px">
        <p class="mb-1">As Pilots, we know what keep us aloft : Lift, Thrust and Money. 
            <br><b>GA Kneeboard</b> has been airborne for 1 year, and the amazing feedback tells us we have the correct heading. Along with the free plan, we now have a paid plan for pilots whom want us to stay aloft for years to come.
        </p>
        <p>
            As we speak, you are over your plan by <b>{{ overage.join(' and ') }}</b>. Please consider what works best for you.
        </p>
        <p>
            Regardless, thanks for having us on your aviation journey.
        </p>
        <div class="actionDialog gap-2">
            <Button label="Show Me Plans" @click="onPlans" link></Button>
            <Button label="OK" @click="emits('close')"></Button>
        </div>
    </Dialog>

</template>


<script setup lang="ts">
import { currentUser } from '../../assets/data';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { onMounted, ref } from 'vue';

const overage = ref<String[]>([])

const emits = defineEmits(['close'])
const router = useRouter()

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

function onPlans() {
    router.push('/plans')
    emits('close')
}

</script>

<style scoped>
p {
    line-height: 1.5rem;
}
</style>
