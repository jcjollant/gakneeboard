import { Airport, Runway, RunwayEnd } from "./models/Airport"

export class AirportTools {
    /**
     * Transform the input to an airport object for UI use
     * @param input 
     * @returns 
     */
    public static format(input:any):Airport|undefined {
        if(input == undefined || input.version == undefined) return undefined
        let output:Airport|undefined = undefined

        if(input.version == 5) {
            output = new Airport(input.code, input.name, input.elev);
            if('ctaf' in input) output.addFrequency( 'CTAF', parseFloat(input.ctaf));
            if('gnd' in input) output.addFrequency( 'GND', parseFloat(input.gnd));
            if( 'weather' in input) output.addFrequency( input.weather.type, parseFloat(input.weather.freq));
            if('effectiveDate' in input) output.setEffectiveDate( input.effectiveDate);
            for( const rwy of input.rwy) {
                const runway = new Runway( rwy.name, rwy.length, rwy.width)
                const endsName = runway.getEndsName()
                for(const endName of endsName) {
                    const rwyEnd = runway.getEnd(endName)
                    if( rwyEnd) {
                        rwyEnd.setMagneticOrientation( rwy[endName].orientation)
                        rwyEnd.setRightPattern(rwy[endName].pattern == 'right')
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
            input.rwy
        } else if ( input.version == 6 || input.version == -1) {
            output = input
        } else {
            output = undefined
        }

        return output
    }

    public static isValidAirportCode(code:string):boolean {
        return Airport.isValidCode(code)
    }
}