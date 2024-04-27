<script setup>
import { defineProps, defineEmits, ref } from "vue";
import {version} from '../assets/data.js'

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const target1 = ref(null)
// onClickOutside(target, ()=>emit('modal-close'))

</script>

<template>
  <div v-if="isOpen" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container" ref="target1">
        <div class="modal-header">
          <slot name="header"> Share Feedback </slot>
        </div>
        <div class="modal-body">
          <slot name="content">Kneeboard primary goal is to help us pilots focusing on Aviate, Navigate and Communicate. Please share how we can improve this at <a href="mailto:jc@jollant.net">jc@jollant.net</a>. <br>I would love to hear your opinion.</slot>
        </div>
        <div class="modal-footer">
          <slot name="footer">
            <div>
              <button @click.stop="emit('close')">Close</button>
            </div>
          </slot>
        </div>
        <div class="version">{{ version }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal-container {
  width: 300px;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  position: relative;
}

.modal-header {
    color: black;
    font-weight: 500;
    font-size: 18px;
    text-decoration: underline;
}

.modal-body {
    text-align: left;
    padding: 15px 0 30px 0;
    font-size: 12px;
    color: #040404;
}

.version {
  position: absolute;
  right: 5px;
  bottom: 5px;
  font-size: 8px;
  color: darkslategrey;
}

</style>