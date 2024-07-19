<script setup>
import { blogUrl, version} from '../assets/data.js'

import Button from 'primevue/button'
import Dialog from 'primevue/dialog';

const emits = defineEmits(["close"]);

</script>
<template>
    <Dialog modal header="How Does It Work ?">
        <div class="hdiw">
            <div class="item">
                <i class="pi pi-file-edit"></i>
                <span>1. Edit</span>
            </div>
            <div class="item">
            <i class="pi pi-print"></i>
            <span>2. Print</span>
            </div>
            <div class="item">
            <i class="pi pi-send"></i>
            <span>3. Fly</span>
            </div>
        </div>
        <div class="detailed-content mb-5">
            <div>1. Click on tiles to match your preferences</div>
            <div>2. Print on Letter size paper</div>
            <div>3. Slap on your kneeboard and focus on the flight</div>
        </div>
        <div>You can also check out the <a :href="blogUrl" target="_blank">blog</a> for tips and tricks</div>
        <div class="actionDialog"><Button label="Got it" @click="emits('close')"></Button></div>
        <div class="versionDialog">{{ version }}</div>
    </Dialog>
</template>

<style scoped>
.hdiw {
    display: flex;
    flex-flow: row;
    justify-content: space-around;
    width: 500px;
    font-size: 1.5rem;
    margin: 1rem 0 2rem 0;
    text-align: center;
}

i {
    font-size: 5rem;
}

.item {
    display: flex;
    flex-flow: column;
}

.detailed-content {
  display: flex;
  flex-flow: column;
}

</style>
