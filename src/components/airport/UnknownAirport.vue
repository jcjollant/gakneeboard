<script setup>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button'

const emits = defineEmits(["close"]);


</script>



<template>
      <Dialog modal header="Unkown Airport">
            <div class="mb-5">
                  <span>You need to be authenticated to create custom airports data</span>
            </div>
            <div class="action gap-2"><Button label="Close" @click="emits('close')"></Button></div>
      </Dialog>
</template>