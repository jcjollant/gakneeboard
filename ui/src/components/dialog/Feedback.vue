<template>
  <div class="drawer-container" @click="isOpen=true">
    <div class="drawer" :class="{'open':isOpen}">
        <textarea class="feedbackText" rows="10"  autoResize v-model="feedbackText" placeholder="Enter your feedback here"></textarea>
        <div class="actions" v-if="isOpen">
          <!-- <div v-if="user && user.loggedIn" class="followup">
            <Checkbox v-model="contactMeValue" inputId="contact" name="reply" value="no" />
            <label for="contact" class="ml-2">Do not contact me about this feedback</label>
          </div> -->
          <div>
            <Button label="Do Not Send" @click="emits('submit')" link></Button>
            <Button label="Send" @click="send" :disabled="feedbackText.length==0"></Button>
          </div>
        </div>

    </div>
</div>
</template>

<script setup lang="ts">
import { onUpdated, ref, watch } from 'vue'
import { getCurrentUser, sendFeedback } from '../../assets/data.js'
import { useToast } from 'primevue/usetoast';
import { useToaster } from '../../assets/Toaster.ts';
import { CurrentUser } from '../../assets/CurrentUser.ts';
import Button from "primevue/button";
import Checkbox from 'primevue/checkbox';

const emits = defineEmits(['submit']);

const feedbackText = ref('')
const contactMeValue = ref('')
const isOpen = ref(false) 
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})
const noUser = CurrentUser.noUser()
const user = ref(noUser)
const toaster = useToaster(useToast());

watch(() => props.open, (newValue) => {
  // console.log('[Feedback.watch] open', newValue, isOpen.value)
  isOpen.value = newValue
})

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
  sendFeedback(feedbackText.value, contactMeValue.value != 'no').then( () => {
    feedbackText.value = ''
    toaster.info('Readback Correct', 'Thanks for your feedback!')
    emits('submit')
  })
}

</script>

<style scoped>
.drawer-container {
  position: relative;
  z-index: 3;
}

.drawer {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 300px;
  background-color: #f0f0f0;
  transform: translateY(300px);
  transition: transform 0.3s ease-in-out;
}

.drawer.open {
  transform: translateY(0);
}

.drawer-content {
  padding: 20px;
}

.feedbackText {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  font-size: 16px;
  resize: none;
}
.followup {
  display: flex;
  align-items: center;
}
.actions {
  display: flex;
  align-items: end;
  justify-content: end;
  gap: 10px;
}
</style>