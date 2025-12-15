<template>
    <Dialog modal header="Version Numbers" style="width: 600px">
        <div class="both">
            <div class="one">
                <div>Interface</div>
                <font-awesome-icon icon="fa-solid fa-display" class="icon"/>
                <div class="number">{{ frontendVersion }}</div>
            </div>
            <div class="one">
                <div>Backend</div>
                <font-awesome-icon icon="fa-solid fa-cloud" class="icon" />
                <div class="number">{{ backendVersion }}</div>
            </div>
        </div>
        <p class="highlight mb-1"><b>Stay Current</b><br/>
        We publish updates on a regular basis. Check <a :href="UserUrl.blog" target="_blank">GA Kneeboard blog</a> for the most current posts.
        </p>
        <div class="actionDialog gap-2">
            <Button label="Dismiss" @click="emits('close')"></Button>
        </div>
    </Dialog>
</template>


<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { UserUrl } from '../../lib/UserUrl.ts'

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';

const backendVersion = ref('')
const frontendVersion = ref('')
const emits = defineEmits(['close'])
const props = defineProps({
    front: { type: Number, default: 0},
    back: { type: String, default: ''},
})


onMounted( () => {
    loadProps(props)
})

watch(props, () => {
    loadProps(props)
})

function loadProps(props) {
    frontendVersion.value = 'v' + props.front;
    backendVersion.value = 'v' + props.back;
}

</script>

<style scoped>
p {
    line-height: 1.5rem;
}
.highlight {
    background-color: lightblue;
    padding: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid darkblue
}
.both {
    display: flex;
    justify-content: center;
    gap: 100px;
    margin-bottom: 1rem;
}
.one {
    display: flex;
    flex-flow: column;
    gap: 10px;
    align-items: center;
}
.icon {
    font-size: 3rem;
}
.number {
    font-size: 2rem;
}
</style>
