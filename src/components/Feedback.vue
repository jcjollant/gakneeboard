<script setup>
// import { defineEmits } from "vue";
import { ref } from 'vue'
import {version, sendFeedback} from '../assets/data.js'
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import FloatLabel from "primevue/floatlabel"

const emits = defineEmits(["sent"]);

const feedbackText = ref('')

/**
 * Send the feedback
 */
async function send() {
  // console.log( 'send feedback')
  const data = {version:version,feedback:feedbackText.value}
  await sendFeedback(data);
  feedbackText.value = ''
  emits('sent')
}

</script>

<template>
  <Dialog modal header="Send Feedback">
    <div class="mb-5">
      <span>We'd love to hear about your experience. Please share your thoughts</span>
    </div>
    <div class="mb-5">
      <FloatLabel>
        <Textarea rows="10" cols="80" autoResize v-model:modelValue="feedbackText"></Textarea>
        <label>What did we miss? What would you change?</label>
      </FloatLabel>
    </div>
    <div class="action gap-2"><Button label="Send" @click="send"></Button></div>
    <div class="version">{{ version }}</div>
  </Dialog>
</template>

<style scoped>
.action {
  display: flex;
  justify-content: end;
}

.version {
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 8px;
  margin:auto;
}


</style>