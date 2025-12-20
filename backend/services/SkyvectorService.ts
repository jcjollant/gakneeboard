import { Airport, AirportSource } from '../models/Airport'
import { AirportDataSource } from '../models/AirportDataSource'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { Runway, RunwaySurface, RunwayEnd, PatternDirection } from '../models/Runway'
import { Frequency } from '../models/Frequency'
import { Navaid } from '../models/Navaid'
import { Atc } from '../models/Atc'

export class SkyvectorService implements AirportDataSource {

    // Cache validation: return true if airport is undefined or effective date is old?
    // For now, SkyVector data is "live", maybe we just assume it's fresh enough if we just fetched it.
    // The interface requires airportIsStale.
    airportIsStale(airport: Airport): Promise<boolean> {
        // Simple strategy: refresh if older than 24h?
        // Or comparing effective date. SkyVector doesn't seem to give strictly "effective date" in a machine readable way easily.
        // Let's rely on fetchTime if available, or just say false for now to avoid loops, 
        // or true if we want to enforce periodic refresh. 
        // AdipService uses a static effective date.
        // Let's stick to: if we have it, it's good for the session/day.
        // But the requirement says "Airport Service should identify SkyVector as the service...". 
        // Let's implement a simple time-based expiry (e.g. 7 days).
        const fourWeeks = 4 * 7 * 24 * 60 * 60 * 1000;
        if (Date.now() - airport.fetchTime > fourWeeks) return Promise.resolve(true);
        return Promise.resolve(false)
    }

    async fetchAirport(code: string, saveRawData?: boolean): Promise<Airport | undefined> {
        const searchUrl = `https://skyvector.com/api/airportSearch?query=${code}`
        try {
            const response = await axios.get(searchUrl, {
                // Axios follows redirects by default (maxRedirects: 5)
                validateStatus: (status) => status < 400 // Accept 302/301 if axios doesn't follow automatically (it does)
            })

            // Check if we were redirected to a search result (failure) or an airport page (success)
            // Axios provides the final URL in response.request.res.responseUrl (Node.js) or response.request.responseURL
            const finalUrl = response.request.res.responseUrl || response.config.url;

            if (finalUrl.includes('/search/site/')) {
                console.log(`[SkyvectorService] Airport ${code} not found (redirected to search).`)
                return undefined
            }

            if (!finalUrl.includes('/airport/')) {
                console.log(`[SkyvectorService] Unexpected URL for ${code}: ${finalUrl}`)
                return undefined
            }

            return this.parseAirport(response.data, code, finalUrl)

        } catch (error) {
            console.error(`[SkyvectorService] Error fetching ${code}:`, error)
            return undefined
        }
    }

    private parseAirport(html: string, code: string, sourceUrl: string): Airport {
        const $ = cheerio.load(html)

        // 1. Name
        // Title format: "CODE - Name | SkyVector"
        const title = $('title').text()
        const namePart = title.split('|')[0].trim() // "SUDU - Durazno/Santa Bernardina International Airport"
        const name = namePart.split('-').slice(1).join('-').trim() || code // "Durazno/Santa Bernardina International Airport"

        // 2. Elevation + Coordinates
        let elevation = 0
        let lat = 0
        let lon = 0

        // Look for Location Information section
        $('.aptdata').each((i, el) => {
            const sectionTitle = $(el).find('.aptdatatitle').text()
            if (sectionTitle.includes(`Location Information for ${code}`)) {
                const text = $(el).text()

                // Elevation
                // "Elevation is 305.0 feet MSL."
                const elevMatch = text.match(/Elevation is\s+([0-9.]+)\s+feet/)
                if (elevMatch) {
                    elevation = parseFloat(elevMatch[1])
                }

                // Coordinates: "S33°21.38' / W56°29.77'"
                // This is in the text roughly as "Coordinates: S33°21.38' / W56°29.77'"
                // Regex for coordinate parsing
                const coordMatch = text.match(/Coordinates:\s+([NS])(\d+)°([\d.]+)'\s+\/\s+([EW])(\d+)°([\d.]+)'/)
                if (coordMatch) {
                    // Lat
                    const latDir = coordMatch[1]
                    const latDeg = parseFloat(coordMatch[2])
                    const latMin = parseFloat(coordMatch[3])
                    lat = latDeg + latMin / 60
                    if (latDir === 'S') lat = -lat

                    // Lon
                    const lonDir = coordMatch[4]
                    const lonDeg = parseFloat(coordMatch[5])
                    const lonMin = parseFloat(coordMatch[6])
                    lon = lonDeg + lonMin / 60
                    if (lonDir === 'W') lon = -lon
                }
            }
        })

        const airport = new Airport(code, name, elevation)
        if (lat !== 0 || lon !== 0) {
            airport.location = { lat, lon }
        }
        airport.source = AirportSource.SkyVector
        airport.fetchTime = Date.now()
        // SkyVector doesn't really have an effective date like ADIP, so use today string?
        airport.effectiveDate = new Date().toISOString()
        airport.sketch = sourceUrl // temporary placeholder or we can leave undefined? 
        // Actually requirements don't ask for sketch url in sketch field specifically, 
        // but saving the source URL might be nice? 
        // Requirements say: "record the airport data in the 'airports' table with a 'skyvector' source"

        // 3. Runways
        const runways: Runway[] = []
        $('.aptdata').each((i, el) => {
            const title = $(el).find('.aptdatatitle').text()
            // "Runway 03/21"
            const rwyMatch = title.match(/Runway\s+(\d+\/?\w*)\/(\d+\/?\w*)/)
            if (rwyMatch) {
                const rwyName = `${rwyMatch[1]}-${rwyMatch[2]}` // 03-21

                // Dimensions
                let length = 0
                let width = 0
                const dimText = $(el).find('th:contains("Dimensions:")').next().text()
                // "7477 x 148 feet / 2279 x 45 meters"
                const dimMatch = dimText.match(/(\d+)\s+x\s+(\d+)\s+feet/)
                if (dimMatch) {
                    length = parseInt(dimMatch[1])
                    width = parseInt(dimMatch[2])
                }

                const runway = new Runway(rwyName, length, width)

                // Surface
                const surfText = $(el).find('th:contains("Surface:")').next().text()
                runway.setRunwaySurface(new RunwaySurface(surfText, ''))

                // Ends info (Headings)
                // The table structure:
                // Heading row: <th>Runway Heading:</th><td>035&deg;</td><td>215&deg;</td>
                const headingRow = $(el).find('th:contains("Runway Heading:")').parent()
                if (headingRow.length) {
                    const headings = headingRow.find('td').map((i, td) => parseInt($(td).text())).get()

                    // Assuming order matches the title (03 then 21)
                    // We need to initialize the ends
                    const ident1 = rwyMatch[1]
                    const ident2 = rwyMatch[2]

                    const end1 = runway.getEnd(ident1)
                    if (end1 && headings[0]) end1.setMagneticOrientation(headings[0])

                    const end2 = runway.getEnd(ident2)
                    if (end2 && headings[1]) end2.setMagneticOrientation(headings[1])
                }

                runways.push(runway)
            }
        })
        airport.addRunways(runways)

        // 4. Frequencies
        // <table id="aptcomms">
        const freqs: Frequency[] = []
        const atcs: Atc[] = [] // if we want to separate them? Adip does.

        $('#aptcomms tr').each((i, row) => {
            const th = $(row).find('th')
            const td = $(row).find('td')
            if (th.length && td.length) {
                const rawName = th.text().trim().replace(/:$/, '') // "DURAZNO TOWER Tower"
                const textFreq = td.text().trim()
                const mhz = parseFloat(textFreq)

                if (!isNaN(mhz)) {
                    // Try to clean name
                    // "DURAZNO TOWER Tower" -> "Tower"? Or just keep full?
                    // Adip logic maps stuff. Here let's just keep strict.
                    freqs.push(new Frequency(rawName, mhz))
                }
            }
        })
        airport.addFrequencies(freqs)

        // 5. Navaids
        // <table id="aptnavaids"> ... inner table ... rows
        // "Nearby Navigation Aids" isn't exactly "on airport" navaids usually, but AdipService loads "navaids".
        // AdipService limits to 10 VORs.
        // Let's parse them.

        const navaids: Navaid[] = []
        $('#aptnavaids tr').each((i, row) => {
            // structure seems to be: <td>img</td> <td>strong text (ID)</td> <td>Name</td> <td>Freq</td> ...
            const tds = $(row).find('td')
            if (tds.length >= 4) {
                const typeImgAlt = $(row).find('img').attr('alt') || '' // "VOR", "NDB" etc
                const id = $(tds[1]).text().trim()
                const name = $(tds[2]).text().trim()
                const freqText = $(tds[3]).text().trim()
                const freq = parseFloat(freqText)

                // bearing/distance?
                // <th>Radial / Range</th>
                // <td>208&deg;</td><td>0.0</td>
                // So indices 4 and 5
                let bearing = 0
                let distance = 0
                if (tds.length >= 6) {
                    bearing = parseFloat($(tds[4]).text())
                    distance = parseFloat($(tds[5]).text())
                }

                if (id && !isNaN(freq)) {
                    navaids.push(new Navaid(id, freq, typeImgAlt, distance, bearing))
                }
            }
        })
        airport.addNavaids(navaids.slice(0, 10))

        return airport
    }
}
