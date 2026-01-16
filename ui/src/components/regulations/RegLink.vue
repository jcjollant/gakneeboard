<template>
  <div class="regulations" :class="{ left: align === Alignment.Left }">
    <div v-for="reg in regs" @click="onRegulation(reg)" class="clickable" :title="reg.desc">{{ reg.value }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, watch } from 'vue';
import { Regulation } from '../../models/Regulation';
import { UserUrl } from '../../lib/UserUrl';
import { Alignment } from '../../models/Alignment';

const props = defineProps({
  regs: {
    type: Array as PropType<Regulation[]>,
    required: true
  },
  align: {
    type: String as PropType<Alignment>,
    default: Alignment.Right
  }
})

function onRegulation(reg:Regulation) {
    if(!reg) return
    UserUrl.open(reg.url)
}

</script>

<style scoped>
.regulations {
    position: absolute;
    display: flex;
    flex-flow: column;
    align-items: flex-end;
    font-size: 11px;
    right: 0;
    bottom: 0;
    color: #666;
}
.regulations.left {
    align-items: flex-start;
    right: auto;
    left: 0;
    text-align: left;
}
</style>