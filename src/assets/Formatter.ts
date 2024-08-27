export class Formatter {
    static noFuel:string = '-.-'
    static noTime:string = '--:--'


    static distance(dist:any) {
        if(dist == null || dist === undefined) return '?'
        if(typeof dist == 'string') return Number(dist).toFixed(1)
        return dist.toFixed(1)
    }


    static fuel(fuel:any) {
        if(fuel == null || fuel == undefined) return Formatter.noFuel
        if(typeof fuel == 'string') return Number(fuel).toFixed(1)
        return fuel.toFixed(1)
    }

    static heading(raw:any) {
        if(raw == null || raw == undefined) return '?'
        let value:number
        if(typeof raw != 'number') {
            value = Number(raw)
        } else {
            value = raw
        }
        if( value < 0) value += 360
        if( value > 359) value %= 360
        return value.toFixed(0)
    }

    static legTime(time:any) {
        if(time == null || time == undefined) return Formatter.noTime
        // transform decimal minutes into minutes and seconds
        const minutes = Math.floor(time)
        const seconds = Math.round((time - minutes) * 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    static speed(value:any) {
        if(value == null || value == undefined) return '?'
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