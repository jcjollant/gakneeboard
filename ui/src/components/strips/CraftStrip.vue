<template>
    <div class="stripContent craft">
        <div class="top" title="Cleared To">CLEARED</div>
        <div class="top">ROUTE</div>
        <div class="top altitude" title="Altitudes">ALTITUDES</div>
        <div class="top" title="Departue Frequency">FREQUENCY</div>
        <div class="top" title="Transponder">XPDR</div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox" title="Climb and Maintain">
            <div class="watermark">C&M</div>
        </div>
        <div class="stripBox" title="Expect in 10 minutes">
            <div class="watermark">Exp</div>
        </div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <StripActions v-if="edit" @action="emits('action', $event)" />
    </div>
</template>

<script setup lang="ts">
import StripActions from './StripActions.vue';

const emits = defineEmits(['action'])
const props = defineProps({
    edit: { type: Boolean, required: false, default: false }
})
</script>

<style scoped>
.craft {
    position: relative;
    display: grid;
    grid-template-columns: 4fr 8fr 2fr 2fr 5fr 4fr;
    grid-template-rows: 1rem 40px;
    width: 100%;
    font-size: 11px;
    gap: 2px;
} 
.altitude {
    grid-column: 3 / span 2;
}
.watermark {
    display: flex;
    justify-content: center;
    align-items: flex-end;
    font-weight:bolder;
    color: lightgrey;
    height: 100%;
    /* justify-content: flex-end; */
}
</style>