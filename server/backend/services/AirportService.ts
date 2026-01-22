import { AdipService } from './AdipService'
import { SkyvectorService } from './SkyvectorService'
import { Airport, versionInvalid, AirportSource } from '../models/Airport'
import { AirportDao } from '../AirportDao'
import { AirportSketch } from '../AirportSketch'
import { AirportView } from '../models/AirportView'
import { CodeAndAirport } from '../models/CodeAndAirport'
import { GApiError } from '../GApiError'
import { AirportCreationRequest } from '../models/AirportCreationRequest'
import { Runway } from '../models/Runway'
import { AirportDataSource } from '../models/AirportDataSource'

export class AirportService {

    public static getAirportCurrentEffectiveDate() {
        return AirportView.formatAsOf(AdipService.currentEffectiveDate())
    }

    /**
     * Get an airport either from postgres or ADIP
     * @param {*} codeParam airport code
     * @param {*} userId pass a value consider custom airports
     * @returns airport object or undefined if not found
     * @throws 400 if code is invalid 
    */
    public static async createAirport(request: AirportCreationRequest): Promise<Airport> {
        if (!AirportService.isValidCode(request.code)) {
            throw new GApiError(400, "Invalid Airport Code");
        }

        const airport = new Airport(request.code, request.name, request.elevation);
        airport.tpa = request.trafficPatternAltitude;
        airport.freq = request.frequencies;
        airport.rwys = request.runways.map((rwy) => new Runway(rwy.name, rwy.length, rwy.width));
        airport.version = Airport.currentVersion;
        // Set effective date to current to ensure it's picked up
        airport.effectiveDate = AdipService.currentEffectiveDate();
        airport.source = AirportSource.User;

        await AirportDao.create(request.code, airport);
        return airport;
    }

    /**
     * Checks if a code is valid (3 or 4 characters)
     * @param code 
     * @returns 
     */
    public static isValidCode(code: string): boolean {
        return code != null && (code.length == 3 || code.length == 4)
    }

    /**
     * Get one airport, which calls getAirports with a single code. The jey difference is getAirport fails with 400 is the code is invalid
     * @param codeParam airportCode
     * @param userId requestorId
     * @returns airport object or undefined if not found
     * @throws 400 if code is invalid 
     */
    public static async getAirport(codeParam: string, userId: any = undefined): Promise<Airport | undefined> {
        return new Promise(async (resolve, reject) => {
            // console.log( "[AirportService.getAirport] " + codeParam + ' user=' + userId);
            // there is only one element and we only care about the airport
            if (!AirportService.isValidCode(codeParam)) return reject(new GApiError(400, "Invalid Airport Code"));

            const codeAndAirportList = (await AirportService.getAirports([codeParam], userId));
            if (!codeAndAirportList.length) return resolve(undefined)
            resolve(codeAndAirportList[0].airport)
        })
    }


    /**
     * Cleans up a list of airport codes
     * @param codes list of airport codes
     * @returns two lists of codes, one valid and cleaned, one invalid
     */
    public static cleanUpCodes(codes: string[]): { valid: string[], invalid: string[] } {
        const valid: string[] = []
        const invalid: string[] = []
        for (const code of codes) {
            const cleaned = code.replace(/[^a-zA-Z0-9]/g, '').trim().toUpperCase()
            if (AirportService.isValidCode(cleaned)) {
                valid.push(cleaned)
            } else {
                invalid.push(code)
            }
        }
        return { valid, invalid }
    }

    /**
     * Builds a list of airports from a list of codes this is the entry point for getting airports
     * @param airportCodes a dirty list of codes
     * @param userId whoever is asking for the airports
     * @returns a list of CodeAndAirport objects
     */
    public static async getAirports(airportCodes: string[], userId: any = undefined): Promise<(CodeAndAirport)[]> {
        // Our objective is to populate the output array with all codes and matching airports when possible otherwise unknown airports 
        const output: (Promise<CodeAndAirport>)[] = []
        const dbWork: (Promise<void>)[] = []

        // clean up codes
        const cleanCodes: { valid: string[], invalid: string[] } = AirportService.cleanUpCodes(airportCodes)

        // lookup clean codes in DB
        const dbCodesLookup: { known: CodeAndAirport[], knownUnknown: CodeAndAirport[], notFound: string[] } = await AirportDao.codesLookup(cleanCodes.valid, userId)
        // console.debug('[AirportService.getAirports] dbCodesLookup', dbCodesLookup)

        // Processing codes that are not in the DB yet
        for (const newCode of dbCodesLookup.notFound) {

            const dataSource = AirportService.getDataSource(newCode)
            let newAirport: Airport | undefined = undefined;
            if (dataSource) {
                newAirport = await dataSource.fetchAirport(newCode)
            } else {
                console.log('[AirportService.getAirports] No data source for', newCode)
            }

            if (newAirport) {
                output.push(Promise.resolve(new CodeAndAirport(newCode, newAirport)))
                // remember this as a valid airport
                dbWork.push(AirportDao.create(newCode, newAirport))
                dbWork.push(AirportSketch.resolve(newAirport, newCode, true))
            } else {
                output.push(Promise.resolve(CodeAndAirport.undefined(newCode)))
                // remember this as a known unknown
                // console.debug('[AirportService.getAirports] marking code for unknown', newCode)
                dbWork.push(AirportDao.createUnknown(newCode))
            }
        }

        // Processing codes that are known unknowns
        for (const found of dbCodesLookup.knownUnknown) {
            output.push(Promise.resolve(CodeAndAirport.undefined(found.code)))
        }

        // Processing codes that are already in the DB
        for (const found of dbCodesLookup.known) {
            const dataSource = AirportService.getDataSource(found.code)
            const modelIsStale = found.airport.version < Airport.currentVersion
            const dataIsStale = dataSource ? await dataSource.airportIsStale(found.airport) : false
            // the airport must be refreshed if the model stale or the data source says it is stale and it is not a custom airport
            const needRefresh = dataSource && (modelIsStale || dataIsStale) && !found.airport.custom
            if (needRefresh) {
                console.debug(`[AirportService.getAirports] Refreshing ${found.code}: modelStale=${modelIsStale}, dataStale=${dataIsStale}, version=${found.airport.version}, effectiveDate=${found.airport.effectiveDate}`)
                const refresher = await dataSource?.fetchAirport(found.code)
                if (refresher) {
                    // preserve the sketch
                    refresher.sketch = found.airport.sketch
                    refresher.id = found.airport.id
                    found.airport = refresher
                    // update the db record
                    // console.debug('[AirportService.getAirports] updating', found.code)
                    dbWork.push(AirportDao.updateAirport(found.airport.id, refresher))
                    // if the sketch was there before, update it
                    if (found.airport.sketch) {
                        refresher.sketch = found.airport.sketch
                    } else {
                        dbWork.push(AirportSketch.resolve(refresher, found.code, true))
                    }
                }
            }
            output.push(Promise.resolve(found))
        }

        // Appending dirty codes
        for (const invalidCode of cleanCodes.invalid) {
            output.push(Promise.resolve(CodeAndAirport.undefined(invalidCode)))
            dbWork.push(AirportDao.createUnknown(invalidCode))
        }

        // housekeeping for db Work
        // console.debug('[AirportService.getAirports] dbWork', dbWork.length)
        await Promise.all(dbWork)

        return Promise.all(output)
    }

    public static async getAirportView(codeParam: string, userId: any = undefined): Promise<AirportView> {
        if (!AirportService.isValidCode(codeParam)) throw new GApiError(400, "Invalid Airport Code");
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
        const airports: (CodeAndAirport)[] = await AirportService.getAirports(airportCodes, userId)
        // console.log('[AirportService.getAirportViewList]', JSON.stringify(airports))

        const output = airports.map((codeAndAirport) => {
            // console.log('[AirportService.getAirportViewList]', code, airport)
            return codeAndAirport.airport ? new AirportView(codeAndAirport.airport) : AirportView.getUndefined(codeAndAirport.code)
        })

        return output
    }

    static getDataSource(code: string): AirportDataSource | undefined {
        // we like codes that have 3 letters or 4 letters starting with K or P  
        if (code.length == 3 || (code.length == 4 && (code.startsWith('K') || code.startsWith('P')))) {
            return new AdipService()
        }
        // Fallback for other 4-letter codes (international)
        if (code.length == 4) {
            return new SkyvectorService()
        }
        return undefined
    }


    static getLocId(code: string) {
        const output = null

        if (AirportService.isValidCode(code)) {
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
        return AdipService.isMilitary(Number(freq))
    }

    static undefinedCodeAndAirport(code: string): CodeAndAirport {
        const airport: Airport = new Airport(code, '', 0)
        airport.version = versionInvalid;
        return new CodeAndAirport(code, airport)
    }

}
