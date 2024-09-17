export class Formatter {
    static noFuel:string = '-.-'
    static noTime:string = '--:--'
    static noFrequency:string = '-.-'
    static noHeading:string = '---'
    static noSpeed:string = '--'

    static altitude(alt:any) {
        // console.log('[format.formatAltitude]', typeof alt, alt)
        if(alt===0) return '0'
        if(!alt) return '?'
        if(typeof alt == 'string') return Number(alt).toFixed(0)
        return alt.toFixed(0)
    }


    static distance(dist:any) {
        if(dist == null || dist === undefined) return '?'
        if(typeof dist == 'string') return Number(dist).toFixed(1)
        return dist.toFixed(1)
    }

    /**
     * Turns a frequency into it's string representation
     * @param freq can be a number, an object with a 'mhz' or 'freq' property, or a string
     * @returns 
     */
    static frequency(freq:any) {
        // console.log('[Formatter.frequency]', typeof freq, JSON.stringify(freq))
        if( !freq && !freq.mhz && !freq.freq) return Formatter.noFrequency
        const value = freq.mhz ? freq.mhz : (freq.freq ? freq.freq : freq);
        return Number(value).toFixed(3)
    }

    static fuel(fuel:any) {
        if(fuel == null || fuel == undefined) return Formatter.noFuel
        if(typeof fuel == 'string') return Number(fuel).toFixed(1)
        return fuel.toFixed(1)
    }

    static heading(raw:any,allowNegative:boolean=false) {
        if(raw == null || raw == undefined || isNaN(raw)) return Formatter.noHeading
        let value:number
        if(typeof raw != 'number') {
            value = Number(raw)
        } else {
            value = raw
        }
        if( value > 359 || value < -359) value %= 360
        if( value < 0 && !allowNegative) value += 360
        return value.toFixed(0) + '°'
    }

    /**
     * Turns a time in decimal minutes into a string HH:MM:SS
     * @param time
     * @returns
     */
    static legTime(time:any) {
        if(time == null || time == undefined) return Formatter.noTime
        // transform decimal minutes into minutes and seconds
        const hours = Math.floor(time / 60)
        const minutes = Math.floor(time % 60)
        const seconds = Math.round((time % 1) * 60)
        const secondsStr = seconds.toString().padStart(2, '0')
        if(hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secondsStr}`
        return `${minutes}:${secondsStr}`
    }

    static speed(value:any) {
        if(value == null || value == undefined) return Formatter.noSpeed
        if(typeof value == 'string') return Number(value).toFixed(0)
        return value.toFixed(0)
    }

    static getDecimalMinutes(time:any) {
        if(!time) return 0;
        if(typeof time == 'number') return time

        const semiPos = time.indexOf(':')
        if( semiPos == -1) return Number(time)

        // transform litteral time format into decimal
        const tokens = time.split(':')
        if( tokens.length == 2) {
            // MM:SS
            return Number(tokens[0]) + Number(tokens[1])/60
        }
        // three tokens is HH:MM:SS
        return Number(tokens[0])*60 + Number(tokens[1]) + Number(tokens[2])/60

    }

}