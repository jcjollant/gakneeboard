<template>
    <Dialog modal header="Version Numbers">
        <div class="version-popup">
            <div class="versions-container mb-5">
                <div class="version-item">
                    <div class="mb-2 font-bold text-lg">Interface</div>
                    <font-awesome-icon icon="fa-solid fa-display" class="large-icon mb-2"/>
                    <div class="text-3xl">{{ frontendVersion }}</div>
                </div>
                <div class="version-item">
                    <div class="mb-2 font-bold text-lg">Backend</div>
                    <font-awesome-icon icon="fa-solid fa-cloud" class="large-icon mb-2" />
                    <div class="text-3xl">{{ backendVersion }}</div>
                </div>
            </div>
            
            <div class="info-box mb-5">
                <div class="font-bold mb-1">Stay Current</div>
                <div>We publish updates on a regular basis. Check <a :href="UserUrl.blog" target="_blank" class="no-underline text-primary">GA Kneeboard blog</a> for the most current posts.</div>
            </div>

            <div class="actionDialog gap-2">
                <Button label="Dismiss" @click="emits('close')"></Button>
            </div>
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
    front: { type: String, default: ''},
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
.version-popup {
    width: 40rem;
}

.versions-container {
    display: flex;
    justify-content: center;
    gap: 5rem;
}

.version-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.large-icon {
    font-size: 3rem;
    color: var(--primary-color);
}

.info-box {
    background-color: var(--surface-100);
    padding: 1rem;
    border-radius: var(--border-radius);
    border-left: 4px solid var(--primary-color);
}
</style>
