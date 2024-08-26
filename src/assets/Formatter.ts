export class Formatter {

    static distance(dist:any) {
        if(!dist) return '?'
        if(typeof dist == 'string') return Number(dist).toFixed(1)
        return dist.toFixed(1)
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