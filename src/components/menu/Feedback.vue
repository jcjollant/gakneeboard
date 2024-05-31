<script setup>
// import { defineEmits } from "vue";
import { onMounted, ref, watch } from 'vue'
import { version, sendFeedback } from '../../assets/data.js'
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Textarea from "primevue/textarea";
import FloatLabel from "primevue/floatlabel"
import Checkbox from 'primevue/checkbox';

const emits = defineEmits(["close","sent"]);

const props = defineProps({
  user: { type: Object, default: null},
})



const feedbackText = ref('')
const contactMeValue = ref('')
const user = ref(null)

function loadProps( props) {
  user.value = props.user
}

onMounted( () => {
  loadProps(props)
})

/**
 * Send the feedback
 */
async function send() {
  // console.log( '[Feedback.send] ' + contactMeValue.value)
  const data = {version:version,feedback:feedbackText.value}
  if( contactMeValue.value == 'yes') {
    data.user = user.value.sha256;
  }
  // console.log( '[Feedback.send] ' + JSON.stringify(data))
  await sendFeedback(data);
  feedbackText.value = ''
  emits('sent')
}

watch( props, async() => {
  loadProps( props)
})

</script>

<template>
  <Dialog modal header="Send Feedback">
    <div class="mb-5">
      <span>We'd love to hear about your experience. Please share your thoughts</span>
    </div>
    <div class="mb-5">
      <div>
        <FloatLabel>
          <Textarea rows="10" cols="80" autoResize v-model:modelValue="feedbackText"></Textarea>
          <label>What did we miss? What would you change?</label>
        </FloatLabel>
      </div>
      <div v-if="user" class="flex align-items-center">
          <Checkbox v-model="contactMeValue" inputId="contact" name="pizza" value="yes" />
          <label for="contact" class="ml-2">It's ok to contact me with follow ups pursuant to this feedback</label>
      </div>
    </div>
    <div class="actionDialog gap-2">
      <Button label="Do Not Send" @click="emits('close')" link></Button>
      <Button label="Send" @click="send" :disabled="feedbackText.length==0"></Button>
    </div>
    <div class="versionDialog">{{ version }}</div>
  </Dialog>
</template>

<style scoped>

</style>