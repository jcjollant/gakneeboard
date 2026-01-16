<template>
  <Dialog modal header="Fellow Pilot!">
    <div class="modal">
        <div class="mb-2">{{ activeQuestion ? activeQuestion : introduction }}</div>
        <div v-if="activeQuestion != null">
            <!-- <FloatLabel> -->
                <Textarea rows="3" cols="74" autoResize v-model:modelValue="activeReply" :placeholder="activeHint"></Textarea>
                <!-- <label>{{ activeHint }}</label> -->
            <!-- </FloatLabel> -->
            <div class="nav">
                <Button label="Prev" link @click="navigate(-1)" :disabled="currentProgress<2"></Button>
                <ProgressBar :value="currentProgress" class="progress" />
                <Button v-if='activeIndex == questions.length - 1' label="Send" @click="send"></Button>
                <Button v-else label="Next" @click="navigate(1)"></Button>
            </div>
        </div>
        <div v-else>
            <div class="actionDialog gap-2">
                <Button label="I'd Rather Not" @click="closeMe" link severity="warning"></Button>
                <Button label="Maybe Next Time" @click="closeMe(false)" link></Button>
                <Button label="Affirm" @click="navigate(0)"></Button>
            </div>
        </div>
    </div>
  </Dialog>   
</template>

<script setup>
import { ref } from 'vue'
import { getCurrentUser, sendFeedback } from '@/assets/data.js'
import { useToast } from 'primevue/usetoast';
import { useToaster } from '@/assets/Toaster.ts';
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Checkbox from 'primevue/checkbox';
import FloatLabel from "primevue/floatlabel"
import ProgressBar from "primevue/progressbar";
import Textarea from "primevue/textarea";

const emits = defineEmits(['close','postpone']);
const introduction = 'Let\'s take GA kneeboard to the next flight level by sharing your thoughts. It\'s quick, useful for Beta and ... good deeds will not go forgotten.'
const questions = [
    {label: 'q1', value: 'How far along are you in your aviation journey?', hint:'Ratings? Working on? ...', reply:''},
    {label: 'q2', value: 'For which flight mission(s) do you use GA Kneeboard?', reply:''},
    {label: 'q3', value: 'What is your biggest challenge with GA Kneeboard?', reply:''},
    {label: 'q4', value: 'What important feature did we miss?', reply:''},
    {label: 'q5', value: 'What would make you willing to pay for GA Kneeboard after Beta?', reply:''},
    ]
let activeIndex = 0
const activeQuestion = ref(null)
const activeHint = ref(questions[0].hint)
const activeReply = ref('')
const feedbackText = ref('')
const contactMeValue = ref('')
const currentProgress = ref(0)
const user = ref(null)
const toaster = useToaster(useToast());

function closeMe(remember=true) {
  emits('close', remember)
}

function navigate(direction) {
    if(direction == 0) {
        activeIndex = 0
    } else {
        // Memorize reply
        questions[activeIndex].reply = activeReply.value
    }
    // update index
    const index = Math.max(Math.min(activeIndex + direction, questions.length - 1), 0)
    activeQuestion.value = questions[index].value
    activeReply.value = questions[index].reply
    activeHint.value = questions[index].hint
    currentProgress.value = (index + 1) / (questions.length) * 100
    activeIndex = index;
    // console.log('[Popup.navigate]', index, currentProgress.value)
}

/**
 * Send the feedback
 */
async function send() {
    // console.log( '[Popup.send]')
    // Memorize last reply
    questions[activeIndex].reply = activeReply.value
    // Build feedback text from questions
    const feedbackValue = questions.map(q => q.label + ': ' + q.reply).join('\n')
    await sendFeedback(feedbackValue, true);
    toaster.info('Readback Correct', 'Thanks for your feedback!')
    closeMe()
}

</script>

<style scoped>
.modal {
    width: 35rem;
}
.progress {
    /* width: 100%; */
    flex-grow: 1;
}
.nav {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  padding-top: 1rem;
  gap: 10px;

}
</style>