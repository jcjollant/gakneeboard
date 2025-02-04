import { Airport } from "./Airport";
import { Frequency, FrequencyType } from "./Frequency";

const noFrequency = '-.-'

export class AtcGroup {
    name:string;
    atcs:Frequency[];
    constructor(name:string) {
        this.name = name
        this.atcs = []
    }
    addFrequency(f:Frequency) {
        // console.log('[AtcGroup.addFreequency] adding', f, this.name)
        this.atcs.push(f)
    }

    static parse(airport:Airport):AtcGroup[] {
        if( !airport || !airport.atc) return []

        const groupList:AtcGroup[] = []
        for( let index = 0; index < airport.atc.length; index++) {
            const atc = airport.atc[index]
            const group = groupList.find( g => atc.name == g.name)
            let useString =  String(atc.use)
            let approach = ''
            let departure = ''
            if( useString.length > 30) {
                approach = 'Apch'
                departure = 'Dep'
            } else {
                approach = 'Approach'
                departure = 'Departure'
            }
            const type = (useString == 'CD/P') ? FrequencyType.clearance : FrequencyType.tracon
            useString = useString.replaceAll('APCH/P', approach).replaceAll('DEP/P', departure).replaceAll('DE/P', departure).replaceAll('CD/P', 'Clearance')
            const frequency = new Frequency(atc.mhz,useString,type)

            if( group) {
                group.addFrequency(frequency)
            } else {
                const newGroup = new AtcGroup(atc.name)
                newGroup.addFrequency(frequency)
                groupList.push(newGroup)
            }
        }
        return groupList;
    }
}



