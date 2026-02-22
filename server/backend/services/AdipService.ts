import { ApiCallDao, ApiName } from '../dao/ApiCallDao'
import { Airport } from '../models/Airport'
import { Chart } from '../models/Chart'
import { Atc } from '../models/Atc'
import { Frequency } from '../models/Frequency'
import { Ils } from '../models/Ils'
import { Navaid } from '../models/Navaid'
import { Runway, RunwaySurface, RunwayEnd, PatternDirection } from '../models/Runway'
import axios from 'axios'
import { AirportChartData } from '../models/AirportChartData'
import { AirportDataSource } from '../models/AirportDataSource'
import { AirportChartSupplementData } from '../models/AiportChartSupplementData'

const maxNavaids: number = 10

export class AdipService implements AirportDataSource {
    airportIsStale(airport: Airport): Promise<boolean> {
        const currentDate = AdipService.currentEffectiveDate()
        const isStale = !airport.effectiveDate || airport.effectiveDate < currentDate

        if (isStale) {
            console.debug(`[AdipService.airportIsStale] ${airport.code} is stale: effectiveDate=${airport.effectiveDate}, current=${currentDate}`)
        }

        return Promise.resolve(isStale)
    }

    static basicAuth: string = 'Basic 3f647d1c-a3e7-415e-96e1-6e8415e6f209-ADIP'
    public static currentEffectiveDate(): string {
        return process.env.EFFECTIVE_DATE
    }

    /**
     * Fetches the current FAA cycle info from ADIP
     * @returns { cycle: string, effectiveDate: string }
     */
    public static async fetchCurrentCycleInfo(): Promise<{ cycle: string, effectiveDate: string }> {
        const rentonCode = 'KRNT';
        const payload = `{ "locId": "${rentonCode}" }`;
        const config = {
            headers: {
                'Authorization': AdipService.basicAuth,
                "Content-Type": "text/plain"
            },
        };

        const chartData = await AdipService.fetchAirportChartData(payload, config);
        const airportDetails = await AdipService.fetchAirportDetails(rentonCode, payload, config, false);

        if (!chartData || !chartData.cycle) {
            throw new Error('Failed to fetch cycle from ADIP');
        }

        if (!airportDetails || !airportDetails.effectiveDate) {
            throw new Error('Failed to fetch effective date from ADIP');
        }

        return {
            cycle: chartData.cycle,
            effectiveDate: airportDetails.effectiveDate
        };
    }

    /**
     * Fetch airport details from Adip then parse it into an Airport object
     * @param code Airport code 
     * @param saveRawData boolean flag indicating whether we should record request data
     * @returns 
     */
    public async fetchAirport(code: string, saveRawData: boolean = true): Promise<Airport | undefined> {
        let locId: string | undefined = undefined
        // if the code is 4 digits, try to turn it into locId
        if (code.length == 4) {
            // console.log( 'ADIP fetching locId for ' + code);
            await axios.post(
                'https://adip.faa.gov/agisServices/api/nq',
                { query: "autoLookupPublicAirportList", param1: code },
                {
                    headers: {
                        'Authorization': AdipService.basicAuth,
                        "Content-Type": 'application/json'
                    },
                })
                .then(response => {
                    // console.log( JSON.stringify(response.data))
                    locId = response.data[0].locId
                    // console.log( "ADIP locId found " + locId)
                })
                .catch(error => {
                    if (error.response) {
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                })
        }

        // let airport:Airport|undefined = undefined
        const fetchCode = locId ? locId : code;
        const payload: string = '{ "locId": "' + fetchCode + '" }'
        const config: any = {
            headers: {
                'Authorization': AdipService.basicAuth,
                "Content-Type": "text/plain"
            },
        }

        const [airport, acd, acsd] = await Promise.all([
            AdipService.fetchAirportDetails(fetchCode, payload, config, saveRawData),
            AdipService.fetchAirportChartData(payload, config),
            AdipService.fetchAirportChartSupplement(payload, config)
        ])

        // enrich airport with approaches if both are defined
        if (airport && acd) {
            airport.iap = acd.iap;
            airport.diagram = acd.diagram
        }
        if (airport && acsd) {
            airport.supplement = acsd.supplementChartName
            airport.notice = acsd.noticeChartName
        }

        // console.log('[AdipService.fetchAirport]', JSON.stringify(airport))

        return airport;
    }

    // invokes ADIP Airport chart data API
    static fetchAirportChartData(payload: string, config: any): Promise<AirportChartData> {
        return new Promise<AirportChartData>((resolve, reject) => {
            axios.post('https://adip.faa.gov/agisServices/public-api/getAirportChartData', payload, config)
                .then((response) => {
                    const acd = AdipService.parseAirportChartData(response.data)
                    resolve(acd)
                })
                .catch(error => {
                    if (error.response) {
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                    reject(error)
                })
        })
    }

    static fetchAirportChartSupplement(payload: string, config: any): Promise<AirportChartSupplementData> {
        return new Promise<AirportChartSupplementData>((resolve, reject) => {
            axios.post('https://adip.faa.gov/agisServices/public-api/getAirportChartSupplementData', payload, config)
                .then((response) => {
                    const acsd = AdipService.parseAirportChartSupplementData(response.data)
                    resolve(acsd)
                })
                .catch(error => {
                    if (error.response) {
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                    reject(error)
                })
        })
    }

    // invokes Adip Airport details API
    static fetchAirportDetails(fetchCode: string, payload: string, config: any, saveRawData: boolean): Promise<Airport | undefined> {
        return new Promise<Airport | undefined>((resolve, reject) => {
            let airport: Airport | undefined = undefined
            axios.post('https://adip.faa.gov/agisServices/public-api/getAirportDetails', payload, config)
                .then(response => {
                    // console.log( '[AdipService.fetchAirportDetails]', JSON.stringify(response.data))
                    try {
                        airport = AdipService.parseAirport(response.data)
                        airport.fetchTime = Date.now();
                    } catch (e) {
                        console.log('[AdipService.fetchAirportDetails] failed to parse data', e)
                        airport = undefined
                    }

                    if (saveRawData) {
                        // save returned adip data
                        try {
                            const dataLength = JSON.stringify(response.data).length;
                            ApiCallDao.save(ApiName.Adip, fetchCode, dataLength);
                        } catch (e) {
                            console.log('[AdipService.fetchAirportDetails] cannot save Adip data')
                        }
                    }

                    // console.log( JSON.stringify(airport))
                    resolve(airport)
                })
                .catch(error => {
                    if (error.response) {
                        console.log(error.response.data);
                        console.log(error.response.status);
                        console.log(error.response.headers);
                    }
                    reject(error)
                })

        })
    }

    // capitalize first letter of each word for airport name
    public static getName(adip: any): string {
        if (!adip || !adip.name) return '?'
        const name: string = adip.name
        let words = name.split(' ')
        const output: string[] = name.split(' ').filter(word => word.length > 0).map(word => word.length > 1 ? (word[0].toUpperCase() + word.substring(1).toLowerCase()) : word)
        return output.join(' ')
    }

    static getOrientation(end: any, magneticVariation: number): number {
        if (!end) return 0
        let orientation = 0
        if ('trueHeading' in end) {
            orientation = end.trueHeading + magneticVariation
        } else if (end.runwayEndId) {
            if (end.runwayEndId == 'NE') {
                orientation = 45
            } else if (end.runwayEndId == 'SE') {
                orientation = 135
            } else if (end.runwayEndId == 'SW') {
                orientation = 225
            } else if (end.runwayEndId == 'NW') {
                orientation = 315
            } else {
                orientation = parseInt(end.runwayEndId) * 10
            }
        }

        return orientation
    }

    static getRunwayEnd(runway: Runway, end: any): RunwayEnd | undefined {
        if (!runway || !end || !end.runwayEndId) return undefined;
        return runway.getEnd(end.runwayEndId)
    }

    static getRunwayFrequency(adip: any, rwy: any): number | undefined {
        let output = undefined
        if (adip && adip.facility && adip.facility.frequencies && rwy && rwy.runwayIdentifier) {
            const candidates = adip.facility.frequencies
                .filter((freq: any) => freq.frequency.includes(rwy.runwayIdentifier))
                .map((freq: any) => AdipService.parseFrequency(freq.frequency))
                .filter((freq: number) => !AdipService.isMilitary(freq))
            if (candidates.length > 0) {
                output = candidates[0]
            }
        }
        return output
    }

    // Build a runway surface from adip rwy object
    static getRunwaySurface(rwy: any): RunwaySurface {
        let rwyType = '?'
        let rwyCondition = '?'
        if (rwy) {
            if (rwy.surfaceType) {
                rwyType = rwy.surfaceType
            } else if (rwy.surfaceTypeCondition) {
                rwyType = rwy.surfaceTypeCondition
            }
            if (rwy.surfaceCondition) {
                rwyCondition = rwy.surfaceCondition
            } else if (rwy.surfaceTypeCondition) {
                rwyCondition = rwy.surfaceTypeCondition
            }
        }

        return new RunwaySurface(rwyType, rwyCondition)
    }

    // 16E => -16
    static getVariation(adip: any): number {
        if (adip && adip.magneticVariation) {
            let output = parseInt(adip.magneticVariation.substring(0, adip.magneticVariation.length - 1))
            if (adip.magneticVariation.slice(-1) == 'E') {
                output = -output;
            }
            return output
        } else {
            return 0
        }
    }

    // checks whether a frequency is military
    public static isMilitary(freq: number): boolean {
        return freq >= 225 || freq < 118
    }

    /**
     * This is the main logic that turns ADIP raw data into Airport
     * @param adip 
     * @returns 
     */
    static parseAirport(adip: any): Airport {
        if (!adip || adip.error == 'noAirportData') throw new Error('No adip data')
        const icaoId: string | undefined = ('icaoId' in adip ? adip.icaoId : undefined)
        const locId: string | undefined = ('locId' in adip ? adip.locId : undefined)
        const name: string = AdipService.getName(adip)
        const elevation: number = adip.elevation
        const airport = new Airport(icaoId, locId, name, elevation)

        // Scan adip.facility.frequencies
        if (adip.ctaf) {
            airport.addFrequency('CTAF', AdipService.parseFrequency(adip.ctaf))
        }
        if (adip.unicom) {
            airport.addFrequency('UNICOM', AdipService.parseFrequency(adip.unicom))
        }
        if (adip.effectiveDate) {
            airport.effectiveDate = adip.effectiveDate
        }
        if (adip.arp) {
            airport.setLocation(adip.arp)
        }
        if (adip.trafficPatternAltitude) {
            airport.setTrafficPatternAltitude(elevation + adip.trafficPatternAltitude)
        }

        // read frequencies
        let weatherFound: boolean = false
        if (adip.facility && adip.facility.frequencies) {
            const frequencyMapping: Record<string, string> = { 'GND/P': 'GND', 'LCL/P': 'TWR', 'LCL/P IC': 'TWR' }
            const frequencies: Frequency[] = adip.facility.frequencies.map((f: any) => {
                let name: string = f.frequencyUse
                // remap some frequencies
                if (name in frequencyMapping) {
                    name = frequencyMapping[name]
                }
                if (name == 'ATIS') weatherFound = true
                // Augment the name with Rwy Name
                return new Frequency(name, AdipService.parseFrequency(f.frequency), AdipService.parseFrequencyNotes(f.frequency))
            })
            // console.log('[AdipService.airportFromDetails]',JSON.stringify(frequencies))
            // add frequencies if they are not military
            airport.addFrequencies(frequencies.filter(f => !AdipService.isMilitary(f.mhz)))
        }
        if (!weatherFound && adip.asosAwos && adip.asosAwos.length > 0 && adip.asosAwos[0].frequency) { // second chance to get weather from asosAwos
            airport.addFrequency(adip.asosAwos[0].sensorType, adip.asosAwos[0].frequency)
        }

        // read runways
        if (adip.runways) {
            const runways = adip.runways.map((rwy: any) => {
                if (!rwy.runwayIdentifier) return undefined
                const name: string = rwy.runwayIdentifier.replace('/', '-')
                const length: number = Number(rwy.length)
                const width: number = Number(rwy.width)
                const runway: Runway = new Runway(name, length, width)
                runway.setRunwaySurface(AdipService.getRunwaySurface(rwy))
                // runway frequency
                runway.freq = AdipService.getRunwayFrequency(adip, rwy)
                // ends
                const magneticVariation: number = AdipService.getVariation(adip)
                for (const rwyEnd of [rwy.baseEnd, rwy.reciprocalEnd]) {
                    const end: RunwayEnd | undefined = AdipService.getRunwayEnd(runway, rwyEnd)
                    if (!end) continue
                    const orientation: number = AdipService.getOrientation(rwyEnd, magneticVariation)
                    end.setMagneticOrientation(orientation)
                    const tp: PatternDirection = AdipService.parseTrafficPattern(rwyEnd)
                    end.setTrafficPattern(tp)
                    // look for localizers
                    const ils = AdipService.parseIls(rwyEnd, end.name)
                    if (ils) {
                        airport.addFrequency('LOC ' + ils.id + ' ' + ils.rwyName, ils.locFreq)
                    }

                }
                return runway
            })
            airport.addRunways(runways.filter((r): r is Runway => r !== undefined))
        }

        // read navaids
        if (adip.navaids) {
            const navaids: Navaid[] = adip.navaids.map((nav: any) => new Navaid(nav.facilityId, nav.frequency, nav.facilityType, nav.distance, nav.bearingToNavaid))
            // only consider VORs and limit the total number to maxNavaids
            airport.addNavaids(navaids.filter(nav => nav.type.includes('VOR')).slice(0, maxNavaids))
        }

        // ATC frequencies
        if (adip.satelliteAirports) {
            // build a raw list without military freq
            const rawList = adip.satelliteAirports.map((sa: any) => {
                const freq: number = AdipService.parseFrequency(sa.frequency);
                let use: string = sa.frequencyUse;
                const name: string = sa.masterAirportName;
                const notes: string = AdipService.parseFrequencyNotes(sa.frequency)
                if (notes.length > 0) use += '(' + notes + ')'
                return { freq: freq, name: name, use: use }
            }).filter((elt: any) => !AdipService.isMilitary(elt.freq))
            // now build the final list with consolidated freq
            const atcs: Atc[] = []
            for (const entry of rawList) {
                const atc = atcs.find(a => a.mhz == entry.freq)
                if (atc) {
                    atc.addUse(entry.use)
                } else {
                    atcs.push(new Atc(entry.freq, entry.name, entry.use))
                }
            }
            // store data
            airport.addAtcs(atcs.sort((a, b) => a.mhz - b.mhz))
        }

        return airport
    }

    // turn the response from fetchAirportChartData into AirportChartData
    static parseAirportChartData(data: any): AirportChartData {
        const output = new AirportChartData()
        if (!data || !data.charts) return output

        output.setCycle(data.cycle)

        for (const c of data.charts) {
            if (c.chartCode == 'IAP') {
                // console.log('IAP', c.pdfName)
                output.addApproach(new Chart(c.chartName, data.cycle + '/' + c.pdfName))
            } else if (c.chartCode == 'APD') {
                output.diagram = data.cycle + '/' + c.pdfName
            } else if (c.chartCode == 'DP') {
                output.addDeparture(new Chart(c.chartName, data.cycle + '/' + c.pdfName))
            }
        }
        return output
    }

    // turn the response from fetchAirportChartSupplementData into AirportChartSupplementData
    static parseAirportChartSupplementData(data: any): AirportChartSupplementData {
        // chartName can be a comma separated list of file names. Notices file name includes "_notices_" in the name
        const chartNames: string[] = data.chartName ? data.chartName.split(',') : []
        // if there is a notice, we are get the filename
        const noticeChartName: string | undefined = chartNames.find((name: string) => name.includes('_notices_'))
        const supplementChartName: string | undefined = chartNames.find((name: string) => !name.includes('_notices_'))
        const output: AirportChartSupplementData = {
            supplementChartName: supplementChartName ? data.cycle + '/' + supplementChartName : undefined,
            noticeChartName: noticeChartName ? data.cycle + '/' + noticeChartName : undefined
        }
        return output
    }

    /**
     * Extract frequency from the rest of the field data
     * Example : "117.7 ;ARR-NE"
     */
    public static parseFrequency(freq: string): number {
        let output: number;
        if (freq.includes(' ;')) {
            output = parseFloat(freq.split(" ;")[0])
        } else {
            output = parseFloat(freq)
        }
        return output
    }

    public static parseFrequencyNotes(freq: string): string {
        if (!freq) return ''
        const index = freq.indexOf(' ;')
        if (index == -1) return ''
        return freq.substring(index + 2);
    }

    static parseIls(rwyEnd: any, rwyName: string = ''): Ils | undefined {
        if (!rwyEnd || !rwyEnd.ils) return undefined
        try {
            return new Ils(rwyEnd.ils.identifier, rwyEnd.ils.localizer.frequency, rwyName)
        } catch (e) {
            console.log('[AdipService.parseIls]', e)
            return undefined;
        }
    }

    static parseTrafficPattern(end: any): PatternDirection {
        if (!end) throw new Error("Invalid end for traffic pattern")
        if (end.rightHandTrafficFlag && end.rightHandTrafficFlag == 'YES') return PatternDirection.Right
        return PatternDirection.Left
    }

    public async refreshAirport(airport: Airport): Promise<Airport> {
        return await this.fetchAirport(airport.code)
    }
}
