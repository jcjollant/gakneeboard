import { AccountType } from "../model/AccounType"

export class Formatter {
    static noFuel:string = '-.-'
    static noTime:string = '--:--'
    public static noFrequency:string = '-.-'
    static noHeading:string = '---'
    static noSpeed:string = '--'

    static accountType(at:AccountType):string {
        switch(at) {
            case AccountType.beta: return 'Beta Deal'; break;
            case AccountType.private: return 'Private Pilot'; break
            case AccountType.instrument: return 'Instrument Pilot'; break;
            case AccountType.simmer: return 'Flight Simmer';
            default: return '?';
        }
    }

    static altitude(alt:any) {
        // console.log('[format.formatAltitude]', typeof alt, alt)
        if(alt===0) return '0'
        if(!alt) return '?'
        if(typeof alt == 'string') return Number(alt).toFixed(0)
        return alt.toFixed(0)
    }

    static compassHeading(heading: number): string {
        let value=heading%360;
        if(value == 0) value = 360;
        return String(value).padStart(3,'0');
    }

    static distance(dist:any) {
        if(dist == null || dist === undefined) return '?'
        if(typeof dist == 'string') return Number(dist).toFixed(1)
        return dist.toFixed(1)
    }

    /**
     * Turns a frequency into it's string representation
     * @param freq can be a number, an object with a 'mhz' or 'freq' property, or a string
     * @returns Formatted string
     */
    static frequency(freq:any):string {
        // console.log('[Formatter.frequency]', typeof freq, JSON.stringify(freq))
        let textValue = Formatter.noFrequency
        if(freq == null || freq == undefined) return textValue;
        if(typeof freq === "number" && freq > 0) {
            return freq.toFixed(3)
        } else if( freq['mhz']) {
            textValue = freq['mhz']
        } else if( freq['freq']) {
            textValue = freq['freq']
        } else if( freq['value']) {
            textValue = freq['value']
        } else {
            return textValue
        }
        // console.log('[Formatter.frequency] output', output)
        return Number(textValue).toFixed(3);
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

    /**
     * Turns a navaid into its bearing
     * @param navaid 
     * @returns 
     */
    static navaid(navaid:any) {
        if(!navaid || !navaid.to) return '-'
        return navaid.to.toFixed(0) + '°'
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