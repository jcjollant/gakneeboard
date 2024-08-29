<script setup>

import Button from 'primevue/button'
import Dialog from 'primevue/dialog';

const emits = defineEmits(["close"]);

</script>
<template>
    <Dialog modal header="Customizable Kneeboard Templates">
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
                <i class="pi pi-clipboard"></i>
                <span>3. Clip</span>
            </div>
        </div>
        <div class="intro mb-5">When I’m flying, my IQ decreases by 30 points. To mitigate, I prioritize having essential information easily accessible on the kneeboard. Originally intended as a supplement to my EFB, the kneeboard printout has now become my primary source of information due to its sheer convenience.</div>
        <div class="detailed-content mb-5">
            <div>1. Click on tiles to match your preferences</div>
            <div>2. Print on Letter size paper</div>
            <div>3. Slap on your kneeboard and go flying!</div>
        </div>
        <div class="actionDialog"><Button label="Got it" @click="emits('close')"></Button></div>
    </Dialog>
</template>

<style scoped>
.hdiw {
    display: flex;
    flex-flow: row;
    justify-content: space-around;
    width: 35rem;
    font-size: 1.5rem;
    margin: 1rem 0 2rem 0;
    text-align: center;
}

i {
    font-size: 5rem;
}

.intro {
    width: 35rem;
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
