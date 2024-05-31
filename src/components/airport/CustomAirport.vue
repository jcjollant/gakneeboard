<script setup>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button'
import InputMask from 'primevue/inputmask'

const emits = defineEmits(["close"]);


</script>



<template>
      <Dialog modal header="Unkown Airport">
            <div class="mb-5">
                  <span>Signed in users will soon be able to create custom airports data</span>
            </div>
            <!-- <div class="flex-auto">
                  <label for="code" class="font-fold block mb-2">Code</label>
                  <InputMask id="code" v-model="value1" mask="aaaa" placeholder="ABCD" />
            </div> -->
            <div class="action gap-2"><Button label="Close" @click="emits('close')"></Button></div>
      </Dialog>
</template>