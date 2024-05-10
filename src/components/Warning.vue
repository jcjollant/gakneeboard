<script setup>
import { ref } from "vue";
import {version} from '../assets/data.js'
import Button from "primevue/button";
import Dialog from 'primevue/dialog'

const emits = defineEmits(["close"]);

const target = ref(null)
// onClickOutside(target, ()=>emit('modal-close'))

</script>

<template>
  <Dialog modal header="Warnings">
    <div class="warning-content mb-5">
      <div class="item mr-3">Airport information</div>
      <div>May not be current. Cross check with an official source before you fly.</div>
      <div class="item mr-3">Traffic Pattern Altitude</div>
      <div>Is calculated by adding 1000ft to field elevation. This may not be true for your situation.</div>
      <div class="item mr-3">Traffic Pattern Entry</div>
      <div>Are calculated theoretical values which may not apply for your situation.</div>
      <div class="item mr-3">Weather Frequency</div>
      <div>Does not account for aircraft direction. Check chart supplements.</div>
      <div class="item mr-3">Runway Frequency</div>
      <div>May not be displayed for airport that have a complex frequency allocation.</div>
      <div class="item mr-3">Magnetic Headings</div>
      <div>Are calculated with FAA variation data which can be quite old at some locations</div>
    </div>    
    <div class="action gap-2"><Button label="Got it" @click="emits('close')"></Button></div>
    <div class="version">{{ version }}</div>
  </Dialog>
</template>

<style scoped>
.action {
  display: flex;
  justify-content: end;
}
.warning-content {
  display: grid;
  grid-template-columns: auto auto;
}
.item {
  font-weight: 700;
  text-align: right;
}
</style>