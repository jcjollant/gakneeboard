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
          <label for="contact" class="ml-2">Let me know when my feedback is addressed</label>
      </div>
    </div>
    <div class="actionDialog gap-2">
      <Button label="Do Not Send" @click="closeMe" link></Button>
      <Button label="Send" @click="send" :disabled="feedbackText.length==0"></Button>
    </div>
  </Dialog>
</template>

<script setup>
// import { defineEmits } from "vue";
import { onUpdated, ref } from 'vue'
import { getCurrentUser, sendFeedback } from '../assets/data.js'
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../assets/Toaster.ts';
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import FloatLabel from "primevue/floatlabel"
import Checkbox from 'primevue/checkbox';

const emits = defineEmits(['close']);

const feedbackText = ref('')
const contactMeValue = ref('')
const user = ref(null)
const toaster = useToaster(useToast());

onUpdated( () => {
  // console.log('[Feedback.onUpdated]')
  user.value = getCurrentUser()
  // console.log('[Feedback.onUpdated]', JSON.stringify(user.value))
})

function closeMe() {
  emits('close')
}

/**
 * Send the feedback
 */
async function send() {
  // console.log( '[Feedback.send] ' + contactMeValue.value)
  await sendFeedback(feedbackText.value, contactMeValue.value == 'yes');
  feedbackText.value = ''
  toaster.info('Readback Correct', 'Thanks for your feedback!')
  closeMe()
}

</script>

<style scoped>

</style>