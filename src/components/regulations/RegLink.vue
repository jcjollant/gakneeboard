<template>
  <div class="regulations">
    <div v-for="reg in regs" @click="onRegulation(reg)" class="clickable" :title="reg.desc">{{ reg.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Regulation } from '../../model/Regulation';
import { UserUrl } from '../../lib/UserUrl';

class Reg {
    known:boolean
    name:string
    url:string
    desc:string
    constructor(name:string, url:string, desc:string = '?', known:boolean = true) {
        this.known = known
        this.name = name
        this.desc = desc
        this.url = url
    }
}

const props = defineProps({
  regs: {
    type: Array,
    required: true
  }
})
const regs = ref<Reg[]>([])

onMounted(() => {
    regs.value = props.regs.map<Reg>((reg: any) => {
        switch(reg) {
            case Regulation.AircraftLights:
                return new Reg(reg, UserUrl.regAircraftLights, 'Aircraft Lights')
            case Regulation.BasicVFRWeatherMiniums:
                return new Reg(reg, UserUrl.regBasicVFRWeatherMin, 'Basic VFR Weather Requirements')
            case Regulation.IFRFlightPlanInformation:
                return new Reg(reg, UserUrl.regIFRFlightPlanInfo, 'IFR Flight Plan: Information Required')
            case Regulation.IFRTwoWayRadioFailure:
                return new Reg(reg, UserUrl.regIFRTwoWayRadioFailure, 'IFR operations: Two-way radio communications failure')
            case Regulation.Far1_1:
                return new Reg(reg, UserUrl.regFar1_1, 'General Definitions') 
            case Regulation.SupplementalOxygen:
                return new Reg(reg, UserUrl.regSupplementalOxygen, 'Supplemental Oxygen')
            case Regulation.RecentFlightExperiencePic:
                return new Reg(reg, UserUrl.regRecentFlightExperiencePic, 'Recent Flight Experience PIC')
            case Regulation.VfrAltitudes:
                return new Reg(reg, UserUrl.regVfrAltitudes, 'VFR cruising altitude') 
            default:
                return new Reg(reg.name, '?', '?', false)

        }
    })
})

function onRegulation(reg:Reg) {
    if(!reg.known) return
    UserUrl.open(reg.url)
}

</script>

<style scoped>
.regulations {
    color: #666;
}
</style>