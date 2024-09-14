<script setup>
import { onMounted, ref } from 'vue'

import { navlogQueue } from '../../assets/data';

import Header from '../shared/Header.vue'
import PlaceHolder from '../shared/PlaceHolder.vue';
import { Formatter } from '../../assets/Formatter';

const items = ref(null)
const emits = defineEmits(['replace'])

function applyData(newNavlog) {
    // console.log('[NavlogTile.applyData] new navlog', JSON.stringify(newNavlog))
    if(!newNavlog || !newNavlog.entries) {
        items.value = null
        return
    }

    const lastItem = newNavlog.entries.length - 1
    items.value = newNavlog.entries.map( (e,index) => {
        let entryClass, attitudeClass
        if(e.att=='+') {
            entryClass = 'entryClimb'
            attitudeClass = 'pi-arrow-up-right attClimb'
        } else if(e.att=='-') {
            entryClass = 'entryDesc'
            attitudeClass = 'pi-arrow-down-right attDesc'
        } else {
            entryClass = ''
            attitudeClass = 'pi-arrow-right attCruise'
        }
        const last = (index == lastItem)
        const targetAltitude = (last ? e.alt : newNavlog.entries[index+1].alt)
        const item = {name:e.name, mh:e.mh, entryClass:entryClass, attClass:attitudeClass, tAlt:targetAltitude, last:last}
        return item;
    })
}

onMounted(() => {
    // register listener for navlog updates
    const existingNavlog = navlogQueue.addListener(applyData)
    if(existingNavlog) applyData(existingNavlog)
})

</script>
<template>
    <div class="navlogTile tile">
        <Header title="NavLog" @replace="emits('replace')"></Header>
        <div class="tileContent">
            <div v-if="items">
                <div v-for="i in items" class="navlogEntry" :class="i.entryClass">
                    <div v-if="i.last" class="nameArrival"> {{ i.name + ' (Arrival)' }}</div>
                    <div v-else class="nameGroup">
                        <div class="entryName">{{ i.name }}</div>
                        <i class='pi attitude' :class="i.attClass"></i>
                        <div>{{ Formatter.altitude(i.tAlt) }}</div>
                    </div>
                    <div v-if="!i.last">{{ Formatter.heading(i.mh) }}</div>
                </div>
            </div>
            <PlaceHolder v-else title="No Log" subtitle="Create a log in the navlog page to show it's summary here" />
        </div>
    </div>

</template>
<style scoped>
.attitude {
    opacity: 0.5;
}
.entryDesc {
    background-color: rgba(0, 255, 0, 0.1);
}
.entryClimb {
    background-color: rgba(255, 0, 0, 0.1);
}
.entryName {
    text-align: left;
    padding-left: 5px;
}
.nameArrival {
    grid-column: 1 / span 2;
}
.nameGroup {
    display: flex;
    align-items: center;
    gap: 5px;
}
.navlogEntry {
    display: grid;
    grid-template-columns: auto 40px;
    font-size: 0.8rem;
    line-height: 1.3rem;
}
</style>