<template>
    <div class="stripContent radio">
        <div class="top">AIRPORT</div>
        <div class="top">ATIS Freq.</div>
        <div class="top">CLEARANCE</div>
        <div class="top">TOWER</div>
        <div class="top">GROUND</div>
        <div class="top">FLTPL</div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="checkBox"></div>
        <StripActions v-if="edit" @action="emits('action', $event)" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import StripActions from '../strips/StripActions.vue';

const emits=defineEmits(['action'])
const edit = ref(false)
const props = defineProps({
    edit: { type: Boolean, required: false, default: false }
})

onMounted(() => {
    edit.value = props.edit
})
watch(props, () => {
    edit.value = props.edit
})
</script>

<style scoped>
.checkBox {
  border: 1px solid #ccc;
  border-radius: 5px;
  background: white;
  margin: 8px 5px;
}
.radio {
    position: relative;
    display: grid;
    grid-template-columns: 2fr 3fr 3fr 3fr 3fr 2rem;
    grid-template-rows: 1rem 40px;
    width: 100%;
    border-right: none;
    font-size: 11px;
    gap: 2px;
} 
.top {
    text-align: center;
    line-height: 1rem;
}

</style>