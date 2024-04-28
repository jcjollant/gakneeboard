<script setup>
import { defineEmits, ref } from "vue";
import {version} from '../assets/data.js'

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const target = ref(null)
// onClickOutside(target, ()=>emit('modal-close'))

</script>

<template>
  <div v-if="isOpen" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container" ref="target">
        <div class="modal-header">
          <slot name="header"> About </slot>
        </div>
        <div class="modal-body">
          <slot name="content">Airport data may not be current. Cross check with an official source before you fly to reduce risks of discrepancy.</slot>
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