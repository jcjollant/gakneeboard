import { Airport, Runway, RunwayEnd, PatternDirection, Frequency } from "./models/Airport"
import { AirportView } from "./models/AirportView"

export class AirportTools {
    static getFrequency(freq:Frequency[], name: string) {
        return freq.find((freq) => freq.name == name)?.mhz
    }
    /**
     * Transform the input to an AirportView object for UI use
     * @param input 
     * @returns 
     */
    public static format(input:any):AirportView|undefined {
        if(input == undefined || input.version == undefined) return undefined
        let output:any = undefined

        if(input.version == 5) {
            // Version 5 needs to be reworked
            output = new Airport(input.code, input.name, input.elev);
            if('ctaf' in input) output.addFrequency( 'CTAF', parseFloat(input.ctaf));
            if('gnd' in input) output.addFrequency( 'GND', parseFloat(input.gnd));
            if( 'weather' in input) output.addFrequency( input.weather.type, parseFloat(input.weather.freq));
            if('effectiveDate' in input) output.setEffectiveDate( input.effectiveDate);
            for( const rwy of input.rwy) {
                const runway = new Runway( rwy.name, rwy.length, rwy.width)
                const endsName = runway.getEndsName()
                for(const endName of endsName) {
                    const rwyEnd:RunwayEnd|undefined = runway.getEnd(endName)
                    if( rwyEnd) {
                        rwyEnd.setMagneticOrientation( rwy[endName].orientation)
                        rwyEnd.setTrafficPattern(rwy[endName].pattern == 'right' ? PatternDirection.Right : PatternDirection.Left)
                    }
                }
                if( 'surface' in rwy) {
                    runway.setSurface(rwy.surface.type, rwy.surface.condition)
                }
                output.addRunway(runway)
                if('freq' in rwy) {
                    output.setRunwayFrequency(rwy.name, parseFloat(rwy.freq))
                }

            }
            output = new AirportView(output)
        } else if ( input.version == 7 || input.version == 6) {
            output = new AirportView(input)
        } else if ( input.version == -1) {
            output = input
        }

        return output
    }

    public static isValidAirportCode(code:string):boolean {
        return Airport.isValidCode(code)
    }
}