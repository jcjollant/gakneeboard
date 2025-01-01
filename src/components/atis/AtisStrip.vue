<template>
    <div class="stripContent weather">
        <div class="top">INFO</div>
        <div class="top">WIND</div>
        <div class="top" title="Visibility">VIS</div>
        <div class="top" title="Sky Condition">SKY</div>
        <div class="top" title="Temperature / Dew Point">T°/DP</div>
        <div class="top" title="Altimeter Setting">ALT</div>
        <div class="top" title="Approach in Use">APCH</div>
        <div class="top" title="Runway in Use">RWY</div>
        <div class="infoBox stripBox"></div>
        <div class="stripBox"></div>
        <!-- <div class="stripBox wind"><div class="gust">G</div></div> -->
        <div class="stripBox"></div>
        <div class="stripBox skyCondition">
            <div v-for="letter in ['C','F','S','B','O']">{{ letter }}</div>
        </div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
        <div class="stripBox"></div>
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
.gust {
    position: absolute;
    left: 5px;
    bottom: 5px;
}
.weather {
    position: relative;
    display: grid;
    grid-template-columns: 1.5fr 5fr 2fr 4fr 4fr 4fr 3fr 3fr;
    grid-template-rows: 1rem 40px;
    width: 100%;
    border-right: none;
    font-size: 11px;
    gap: 2px;
} 
.wind {
    position: relative;
}
.top {
    text-align: center;
    line-height: 1rem;
}

.rightAlign {
    text-align: right;
}
.infoBox {
    border: 2px solid grey;
}
.skyCondition {
    display: flex;
    justify-content: space-around;
    font-weight: bolder;
    color: darkgrey;
}
</style>