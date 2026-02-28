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
     * @returns airport object or undefined if not found
     * @throws 400 if code is invalid 
    */
    public static async createAirport(request: AirportCreationRequest): Promise<Airport> {
        if (!AirportService.isValidIcaoId(request.icaoId)) {
            throw new GApiError(400, `Invalid ICAO identifier [${request.icaoId}]`);
        }

        const airport = new Airport(request.icaoId, undefined, request.name, request.elevation);
        airport.tpa = request.trafficPatternAltitude;
        airport.freq = request.frequencies;
        airport.rwys = request.runways.map((rwy) => new Runway(rwy.name, rwy.length, rwy.width));
        airport.version = Airport.currentVersion;
        // Set effective date to current to ensure it's picked up
        airport.effectiveDate = AdipService.currentEffectiveDate();
        airport.source = AirportSource.User;

        await AirportDao.create(airport);
        return airport;
    }

    /**
     * Checks if a code is valid (3 or 4 characters)
     * @param code 
     * @returns 
     */
    public static isValidCode(code: string): boolean {
        return code != null && (code.length == 3 || (code.length == 4 && AirportService.isValidIcaoId(code)))
    }

    public static isValidIcaoId(code: string): boolean {
        // code should be 4 letters/numbers
        const regex = /^[a-zA-Z0-9]{4}$/;
        return code != null && regex.test(code)
    }

    /**
     * Get one airport, which calls getAirports with a single code. The jey difference is getAirport fails with 400 is the code is invalid
     * @param codeParam airportCode
     */
    public static async getAirport(codeParam: string): Promise<Airport | undefined> {
        return new Promise(async (resolve, reject) => {
            // console.log( "[AirportService.getAirport] " + codeParam);
            // there is only one element and we only care about the airport
            if (!AirportService.isValidCode(codeParam)) return reject(new GApiError(400, `Invalid Airport Code [${codeParam}]`));

            const codeAndAirportList = (await AirportService.getAirports([codeParam]));
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
     */
    public static async getAirports(airportCodes: string[]): Promise<(CodeAndAirport)[]> {
        // Our objective is to populate the output array with all codes and matching airports when possible otherwise unknown airports 
        const output: (Promise<CodeAndAirport>)[] = []
        const dbWork: (Promise<void>)[] = []

        // clean up codes
        const cleanCodes: { valid: string[], invalid: string[] } = AirportService.cleanUpCodes(airportCodes)

        // lookup clean codes in DB
        const dbCodesLookup: { known: CodeAndAirport[], knownUnknown: CodeAndAirport[], notFound: string[] } = await AirportDao.codesLookup(cleanCodes.valid)
        // console.debug('[AirportService.getAirports] dbCodesLookup', dbCodesLookup)

        // Processing codes that are not in the DB yet
        for (const newCode of dbCodesLookup.notFound) {

            let newAirport: Airport | undefined = undefined;

            // 1. Always try ADIP first
            const adipService = new AdipService();
            const adipAirport = await adipService.fetchAirport(newCode);

            // 2. Check if ADIP result is an exact match for the requested code
            if (adipAirport && (adipAirport.icaoId === newCode || adipAirport.locId === newCode)) {
                newAirport = adipAirport;
            }
            // 3. If not found in ADIP or not an exact match, try Skyvector for 4-char codes
            else if (newCode.length === 4) {
                const skyvectorService = new SkyvectorService();
                newAirport = await skyvectorService.fetchAirport(newCode);
            }

            if (newAirport) {
                output.push(Promise.resolve(new CodeAndAirport(newCode, newAirport)))
                // remember this as a valid airport
                await AirportDao.create(newAirport)
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
            const dataSource = AirportService.getDataSource(found.airport)
            const modelIsStale = found.airport.version < Airport.currentVersion
            const dataIsStale = dataSource ? await dataSource.airportIsStale(found.airport) : false
            // the airport must be refreshed if the model stale or the data source says it is stale and it is not a custom airport
            const needRefresh = dataSource && (modelIsStale || dataIsStale)
            if (needRefresh) {
                // console.debug(`[AirportService.getAirports] Refreshing ${found.code}: modelStale=${modelIsStale}, dataStale=${dataIsStale}, version=${found.airport.version}, effectiveDate=${found.airport.effectiveDate}`)
                const refresher = await dataSource?.fetchAirport(found.code)
                if (refresher && (refresher.icaoId === found.code || refresher.locId === found.code || refresher.source === AirportSource.SkyVector)) {
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

    public static async getAirportView(codeParam: string): Promise<AirportView> {
        if (!AirportService.isValidCode(codeParam)) throw new GApiError(400, `Invalid Airport Code [${codeParam}]`);
        const list = await AirportService.getAirportViewList([codeParam])
        if (!list.length) throw new GApiError(404, "Airport not found");
        return list[0]
    }

    /**
     * 
     * @param {*} airportCodes A list of airport codes
     * @returns a list of corresponding airport data, which may be undefined
    */
    public static async getAirportViewList(airportCodes: string[]): Promise<AirportView[]> {
        // console.log('[AirportService.getAirportViewList] codes', JSON.stringify(airportCodes))
        const airports: (CodeAndAirport)[] = await AirportService.getAirports(airportCodes)
        // console.log('[AirportService.getAirportViewList]', JSON.stringify(airports))

        const output = airports.map((codeAndAirport) => {
            // console.log('[AirportService.getAirportViewList]', code, airport)
            return codeAndAirport.airport ? new AirportView(codeAndAirport.airport) : AirportView.getUndefined(codeAndAirport.code)
        })

        return output
    }

    static getDataSource(airport: Airport): AirportDataSource | undefined {
        if (airport.source === AirportSource.Adip) {
            return new AdipService();
        } else if (airport.source === AirportSource.SkyVector) {
            return new SkyvectorService();
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
        const airport: Airport = new Airport(code, undefined, '', 0)
        airport.version = versionInvalid;
        return new CodeAndAirport(code, airport)
    }

}
