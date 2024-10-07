<template>
  <Dialog modal header="Give Feedback">
    <!-- <div class="mb-5">
      <span>We'd love to hear about your experience.</span>
    </div> -->
    <div class="mb-5 mt-4">
      <div>
        <FloatLabel>
          <Textarea rows="10" cols="80" autoResize v-model:modelValue="feedbackText"></Textarea>
          <label>How can we improve your experience?</label>
        </FloatLabel>
      </div>
      <div v-if="user && user.loggedIn" class="flex align-items-center">
          <Checkbox v-model="contactMeValue" inputId="contact" name="pizza" value="yes" />
          <label for="contact" class="ml-2">It's ok to contact me with follow ups pursuant to this feedback</label>
      </div>
    </div>
    <div class="actionDialog gap-2">
      <Button label="Do Not Send" @click="emits('close')" link></Button>
      <Button label="Send" @click="send" :disabled="feedbackText.length==0"></Button>
    </div>
  </Dialog>
</template>

<script setup>
// import { defineEmits } from "vue";
import { onUpdated, ref } from 'vue'
import { getCurrentUser, sendFeedback } from '../../assets/data.js'
import { emitToastInfo } from '../../assets/toast.js';
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import FloatLabel from "primevue/floatlabel"
import Checkbox from 'primevue/checkbox';

const emits = defineEmits(["close","toast"]);

const feedbackText = ref('')
const contactMeValue = ref('')
const user = ref(null)

onUpdated( () => {
  // console.log('[Feedback.onUpdated]')
  user.value = getCurrentUser()
  // console.log('[Feedback.onUpdated]', JSON.stringify(user.value))
})

/**
 * Send the feedback
 */
async function send() {
  // console.log( '[Feedback.send] ' + contactMeValue.value)
  await sendFeedback(feedbackText.value, contactMeValue.value == 'yes');
  feedbackText.value = ''
  emitToastInfo(emits, 'Readback Correct', 'Thanks for your feedback!')
  emits('close')
}

</script>

<style scoped>

</style>