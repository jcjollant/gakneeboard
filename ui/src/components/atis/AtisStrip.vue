<template>
    <div class="stripContent">
        <div v-if="header" class="weather">
            <div class="top" v-if="header">INFO</div>
            <div class="top" v-if="header">WIND</div>
            <div class="top" v-if="header" title="Visibility">VIS</div>
            <div class="top" v-if="header" title="Sky Condition">SKY</div>
            <div class="top" v-if="header" title="Temperature / Dew Point">T°/DP</div>
            <div class="top" v-if="header" title="Altimeter Setting">ALT</div>
            <div class="top" v-if="header" title="Approach in Use">APCH</div>
            <div class="top" v-if="header" title="Runway in Use">RWY</div>
        </div>
        <div class="weather fields">
            <div class="infoBox stripBox"></div>
            <div class="stripBox inline">
                <div v-for="letter in ['Clm','Vrb','Gst']" class="wtrmrk">{{ letter }}</div>
            </div>
            <div class="stripBox inline"><div class="wtrmrk">10+</div></div>
            <div class="stripBox inline">
                <div v-for="letter in ['Fw','Sc','Br','Ov']" class="wtrmrk">{{ letter }}</div>
            </div>
            <div class="stripBox"></div>
            <div class="stripBox inline">
                <div v-for="letter in ['28','29','30']" class="wtrmrk">{{ letter }}</div>
            </div>
            <div class="stripBox"></div>
            <div class="stripBox"></div>
        </div>
        <StripActions v-if="edit" @action="emits('action', $event)" />
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import StripActions from '../strips/StripActions.vue';

const emits = defineEmits(['action'])
const edit = ref(false)
const props = defineProps({
    edit: { type: Boolean, required: false, default: false },
    header: { type: Boolean, required: false, default: true }
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
.inline {
    display: flex;
    justify-content: space-around;
    font-weight: bolder;
}
.stripBox {
    position: relative;
}
.fields {
    height: 40px;
}
</style>