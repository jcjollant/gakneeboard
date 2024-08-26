const noFrequency = '-.-'
const noTime = '--:--'

export function formatAltitude(value) {
    if(!value) return '?'
    if(typeof value == 'string') return Number(value).toFixed(0)
    return value.toFixed(0)
}

export function formatAtcGroups(airport, enrichment=undefined) {
    if( !airport || !airport.atc) return []

    const groupList = []
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
        useString = useString.replaceAll('APCH/P', approach).replaceAll('DEP/P', departure).replaceAll('DE/P', departure)
        const entry = {mhz:atc.mhz, use:useString}

        // perform enrichment if necessary
        if( enrichment) enrichment(entry);

        if( group) {
            group.atcs.push(entry)
        } else {
            groupList.push({name:atc.name, atcs:[entry]})
        }
    }
    return groupList;
}

export function formatFrequency(freq) {
    // console.log('[Corner.formatFrequency]', typeof freq)
    if( !freq || (!freq.mhz && !freq.freq)) return noFrequency
    const value = freq.mhz ? freq.mhz : freq.freq;
    return value.toFixed(3)
}

export function formatFuel(fuel) {
    if(!fuel) return '?'
    if(typeof fuel == 'string') return Number(fuel).toFixed(1)
    return fuel.toFixed(1)
}

export function formatLegTime(time) {
    if(!time) return noTime
    // transform decimal minutes into minutes and seconds
    const minutes = Math.floor(time)
    const seconds = Math.round((time - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

