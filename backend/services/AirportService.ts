import { Adip } from '../adip/Adip'
import { Airport, versionInvalid, AirportSource } from '../models/Airport'
import { AirportDao } from '../AirportDao'
import { AirportSketch } from '../AirportSketch'
import { AirportView } from '../models/AirportView'
import { CodeAndAirport } from '../models/CodeAndAirport'
import { GApiError } from '../GApiError'
import { AirportCreationRequest } from '../models/AirportCreationRequest'
import { Runway } from '../models/Runway'

export class AirportService {

    public static getAirportCurrentEffectiveDate() {
        return AirportView.formatAsOf(Adip.currentEffectiveDate())
    }

    /**
     * Get an airport either from postgres or ADIP
     * @param {*} codeParam airport code
     * @param {*} userId pass a value consider custom airports
     * @returns airport object or undefined if not found
     * @throws 400 if code is invalid 
    */
    public static async createAirport(request: AirportCreationRequest): Promise<Airport> {
        if (!Airport.isValidCode(request.code)) {
            throw new GApiError(400, "Invalid Airport Code");
        }

        const airport = new Airport(request.code, request.name, request.elevation);
        airport.tpa = request.trafficPatternAltitude;
        airport.freq = request.frequencies;
        airport.rwys = request.runways.map((rwy) => new Runway(rwy.name, rwy.length, rwy.width));
        airport.version = Airport.currentVersion;
        // Set effective date to current to ensure it's picked up
        airport.effectiveDate = Adip.currentEffectiveDate();
        airport.source = AirportSource.User;

        await AirportDao.create(request.code, airport);
        return airport;
    }

    public static async getAirport(codeParam: string, userId: any = undefined): Promise<Airport | undefined> {
        return new Promise(async (resolve, reject) => {
            // console.log( "[AirportService.getAirport] " + codeParam + ' user=' + userId);
            // there is only one element and we only care about the airport
            if (!Airport.isValidCode(codeParam)) return reject(new GApiError(400, "Invalid Airport Code"));

            const codeAndAirportList = (await AirportService.getAirportList([codeParam], userId));
            if (!codeAndAirportList.length) return resolve(undefined)
            resolve(codeAndAirportList[0].airport)
        })
    }

    /**
     * Evaluates whether an airport needs to be refreshed due to model change or effectiveDate
     * @param code Clear Airport code
     * @param airports List of known airports
     * @returns The corresponding match, which could have an undefined Airport
     */
    static async getAirportCurrent(code: string, airports: CodeAndAirport[]): Promise<CodeAndAirport> {
        // console.log('[AirportService.getAirportCurrent]', code)
        // store the found value [code,airport]
        const found = airports.find((codeAndAirport) => codeAndAirport.code == code)

        // Unknown stuff : Invalid Code / Legit New / Unknown valid code
        if (!found) {
            // invalid code =>
            if (!Airport.isValidCode(code)) return CodeAndAirport.undefined(code)

            // First time we see that code => Adip
            let firstTimer: Airport | undefined = await Adip.fetchAirport(code)

            // unknown airport
            if (!firstTimer || firstTimer.code == '?') {
                await AirportDao.createUnknown(code);
                return CodeAndAirport.undefined(code)
            }
            // new airport
            await AirportDao.create(code, firstTimer);
            await AirportSketch.resolve(firstTimer, code, true)
            return new CodeAndAirport(code, firstTimer)
        }

        // console.log('[AirportService.getAirportList] found', found.code)
        const airport: Airport = found.airport

        // Is this a known unknown?
        if (!airport || airport.version == versionInvalid) {
            return CodeAndAirport.undefined(code)
        }


        const versionCurrent: boolean = (airport.version == Airport.currentVersion);
        const dateCurrent: boolean = (airport.effectiveDate == Adip.currentEffectiveDate())
        // Happy path : data is already current or airport is custom (which we don't update)
        if (airport.custom || versionCurrent && dateCurrent) {
            return new CodeAndAirport(code, airport)
        }

        // data needs to be refreshed => Adip
        let refresher: Airport | undefined = await Adip.fetchAirport(code)
        if (refresher) {
            // update this record in the database
            if (airport.id) {
                // update airport data
                await AirportDao.updateAirport(airport.id, refresher)

                // restore sketch
                if (airport.sketch) {
                    refresher.sketch = airport.sketch
                } else {
                    // consider refreshing the skecth
                    await AirportSketch.resolve(refresher, code, true)
                }
            } else {
                console.log('[AirportService.getAirportCurrent] Could not update', code, 'due to missing Id')
            }
            return new CodeAndAirport(code, refresher)
        }

        // well, we tried but there is something fishy as this code was known before but Adip failed
        console.log('[AirportService.getAirportCurrent] Adip could not refresh', code)
        return new CodeAndAirport(code, airport)
    }

    /**
     * Cleans up a list of airport codes
     * @param codes list of airport codes
     * @returns list of cleaned up codes
     */
    public static cleanUpCodes(codes: string[]): string[] {
        return codes.map(code => code.replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase())
    }

    /**
     * Builds a list of airports from a list of codes
     * @param airportCodes 
     * @param userId 
     * @returns 
     */
    public static async getAirportList(airportCodes: string[], userId: any = undefined): Promise<(CodeAndAirport)[]> {
        // clean up airport codes
        const cleanCodes: string[] = AirportService.cleanUpCodes(airportCodes)
        // Read airports fromDB
        const knownAirports: CodeAndAirport[] = await AirportDao.readList(cleanCodes, userId)
        // rebuild the full list along with unknowns(undefined)
        const output: (Promise<CodeAndAirport>)[] = []
        for (const code of cleanCodes) {
            output.push(AirportService.getAirportCurrent(code, knownAirports))
        }
        return Promise.all(output)
    }

    public static async getAirportView(codeParam: string, userId: any = undefined): Promise<AirportView> {
        if (!Airport.isValidCode(codeParam)) throw new GApiError(400, "Invalid Airport Code");
        const list = await AirportService.getAirportViewList([codeParam], userId)
        if (!list.length) throw new GApiError(404, "Airport not found");
        return list[0]
    }

    /**
     * 
     * @param {*} airportCodes A list of airport codes
     * @returns a list of corresponding airport data, which may be undefined
    */
    public static async getAirportViewList(airportCodes: string[], userId = undefined): Promise<AirportView[]> {
        // console.log('[AirportService.getAirportViewList] codes', JSON.stringify(airportCodes), 'user', userId)
        const airports: (CodeAndAirport)[] = await AirportService.getAirportList(airportCodes, userId)
        // console.log('[AirportService.getAirportViewList]', JSON.stringify(airports))

        const output = airports.map((codeAndAirport) => {
            // console.log('[AirportService.getAirportViewList]', code, airport)
            return codeAndAirport.airport ? new AirportView(codeAndAirport.airport) : AirportView.getUndefined(codeAndAirport.code)
        })

        return output
    }


    /**
     * Turn code into an ICAO code
     * @param {*} code anything to be turned into an ICAO code
     * @returns a four letter icao code or null if not valid
    */
    public static getIcao(code: string): string | null {
        const output = null
        if (Airport.isValidCode(code)) {
            if (code.length == 3) {
                return ('K' + code.toUpperCase())
            } else if (code.length == 4) {
                return code.toUpperCase()
            }
        }
        return null
    }

    static getLocId(code: string) {
        const output = null

        if (Airport.isValidCode(code)) {
            if (code.length == 3) {
                return code.toUpperCase()
            } else if (code.length == 4) {
                return code.substring(1, 4).toUpperCase()
            }
        }
        return null
    }

    public static isMilitary(freq: string) {
        if (freq == null) return false;
        if (freq == '-.-') return false;
        return Adip.isMilitary(Number(freq))
    }

}
