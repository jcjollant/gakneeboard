import { Metar } from '@checklist/shared'
import axios from 'axios'
import { Airport } from '../models/Airport'
import { AirportCreationRequest } from '../models/AirportCreationRequest'
import { Notam } from '../models/Notam'
import { UrlService } from './UrlService'
import { LocalStoreService } from './LocalStoreService'
import { backend, sessionAirports, currentUser } from '../assets/data'

// We need to duplicate these from data.js or export them from there if they aren't already
// data.js exports `backend`, `sessionAirports`, `currentUser`.
// reportError is in data.js but not exported or it is exported? It is exported: export function reportError(message)

import { reportError } from '../assets/data'

let pendingCodes: string[] = []

function airportCurrent(airport: any) {
    if (!backend.ready && !airport) return false;
    // console.log('[data.airportCurrent', airport.asof, backend.airportEffectiveDate)
    const dateMatch = airport.asof && backend.airportEffectiveDate && airport.asof == backend.airportEffectiveDate
    const modelMatch = airport.version && backend.airportModelVersion && airport.version == backend.airportModelVersion
    // console.log( '[data.airportCurrent] ' + airport.code + ' ' + dateMatch + ' ' + modelMatch )
    return dateMatch && modelMatch;
}

/**
 * Query airport data backend
 * @param {*} codeParam airport code, case doesn't matter
 * @param {*} group whether this request should be grouped with others
 * @returns airport data
 */
export async function getAirport(codeParam: string, group = false) {
    // console.log('[data.getAirport]', codeParam)
    if (!codeParam) return null;
    const code = codeParam.toUpperCase()

    // console.log( '[data.getAirport]', code);
    let airport = null

    // weed out incomplete or invalid codes
    if (!Airport.isValidCode(code)) {
        // console.log( '[data.getAirport] invalid code ' + code)
        return airport
    }

    // do we already have this airport in memory?
    if (code in sessionAirports.data) {
        // return value may by null if the code was not found
        return sessionAirports.get(code)
    }

    // if this code is already in the queue we'll just wait for the data
    if (pendingCodes.includes(code)) {
        // console.log( '[data.getAirport] already in queue ' + code)
        return await waitForAirportData(code)
    }

    try {
        const localAirport = LocalStoreService.airportGet(code)
        // we have local airport information
        if (backend.ready) {
            if (airportCurrent(localAirport)) {
                // console.log('[data.getAirport] localAirport ', code, 'is current')
                // Airport data is current add to session airports and return it
                sessionAirports.set(code, localAirport)
                // console.log('[data.getAirport] localAirport ', code, 'is current')
                return localAirport;
            }
        }
        // Either airport data is stale or backend is not ready
        // Add a promise to the localAirport that will return investigation outcome
        (localAirport as any).promise = new Promise(async (resolve) => {
            // if backend is ready this will resolve immediately
            if (backend.promise) {
                await (backend.promise as Promise<any>).then(() => {
                    // compare effective date and model version
                    if (airportCurrent(localAirport)) {
                        sessionAirports.set(code, localAirport)
                        // console.log('[data.getAirport] localAirport ', code, 'was current')
                        resolve({ current: true, airport: localAirport })
                    } else {
                        // turn out this data was stale, remove it from localStorage
                        LocalStoreService.airportRemove(code)
                        getAirport(code, false).then(airport => {
                            sessionAirports.set(code, airport)
                            resolve({ current: false, airport: airport })
                        }).catch((e) => {
                            reportError('[data.getAirport] error getting new airport data' + JSON.stringify(e))
                            resolve({ current: false, airport: null })
                        })
                    }
                })
            } else {
                // Should not happen if app is initialized correctly, but resolve safely
                resolve({ current: false, airport: null })
            }

        })
        // we return stale airport with promise
        return localAirport;
    } catch (e) {
        // no local copy
    }

    // add ourselves to the list of pending queries
    // console.log( '[data.getAirport] adding to queue', code);
    pendingCodes.push(code)
    // console.log( '[data.getAirport]', code, 'enqueued', JSON.stringify(pendingCodes));

    if (group) {
        // Are we still getting new queries?
        const beforeCount = pendingCodes.length
        await new Promise(r => setTimeout(r, 500));

        if (beforeCount == pendingCodes.length) { // no queries withing the last 500 ms
            // go ahead and place the query
            await requestAllAirports(pendingCodes)
        }
        airport = await waitForAirportData(code)

    } else { // grouping is not allowed

        // wait until the current code is in first position
        while (pendingCodes.length > 0 && pendingCodes[0] != code) {
            // console.log( '[data.getAirport] waiting for', pendingCodes[0], pendingCodes.length, maxWait)
            await new Promise(r => setTimeout(r, 1000));
        }

        // Request that one code
        airport = await requestOneAirport(code)

        // remove ourselves from the first position in the queue
        pendingCodes.shift()
        // console.log( '[data.getAirport]', code, 'removed from queue', JSON.stringify(pendingCodes))
    }

    // save this data in local storage
    if (airport && airport.version != -1) LocalStoreService.airportAdd(code, airport)

    return airport
}

/**
 * Our data has already been requested, we are waiting for it
 * @param {*} code 
 * @returns 
 */
async function waitForAirportData(code: string) {
    // console.log( 'waiting for ' + code) 
    while (!(code in sessionAirports.data)) {
        await new Promise(r => setTimeout(r, 250));
    }
    // console.log( 'done waiting for ' + code)
    return sessionAirports.get(code)
}

/**
 * Request a list of airports by code
 * @param {*} codes 
 * @returns 
 */
async function requestAllAirports(codes: string[]) {
    // console.log( 'perform group request for ' + codes.length)
    const url = UrlService.root + 'airports/' + codes.join('-');
    await currentUser.getUrl(url)
        .then(response => {
            // console.log( JSON.stringify(response.data))
            const airportList = response.data
            airportList.forEach((airport: any) => {
                // memorize this airport
                sessionAirports.set(airport.code, airport)
                // remove this code from pending codes
                pendingCodes.splice(pendingCodes.indexOf(airport.code), 1)
                // console.log('[data.requestAllAirports]', airport.code,'removed',JSON.stringify(pendingCodes))
            })
        })
        .catch(error => {
            // this request failed, cache all airports as invalid
            codes.forEach(code => {
                sessionAirports.setInvalid(code)
            })
            reportError('[data.requestAllAirports] error ' + JSON.stringify(error))
        })
}

/**
 * Perform the API request for a single airport code
 * @param {*} code 
 * @returns 
 */
async function requestOneAirport(code: string) {
    // console.log( '[data.requestOneAirport]', code)
    let airport = null

    const url = UrlService.root + 'airport/' + code;
    await currentUser.getUrl(url)
        .then(response => {
            // console.log( '[data.requestOneAirport] received', JSON.stringify(response.data))
            airport = response.data
            // add this data to cache
            sessionAirports.set(code, airport)
            // console.log( 'added to cache ' + code)
        })
        .catch(error => {
            // cache this airport as invalid
            sessionAirports.setInvalid(code)
            pendingCodes = []
        })

    return airport
}

const contentType = { headers: { 'Content-Type': 'application/json' } }

export async function createAirport(request: AirportCreationRequest) {
    const url = UrlService.root + 'airport'
    const payload = { user: currentUser.sha256, request: request }
    // console.debug('[AirportDataService.createAirport] payload', payload)
    await axios.post(url, payload, contentType)
        .then(response => {
            if (response.data && response.data.code) {
                sessionAirports.set(response.data.code, response.data)
            }
        })
        .catch(error => {
            reportError('[AirportDataService.createAirport] error ' + JSON.stringify(error))
            throw error
        })
}

export async function getNotams(airportCode: string): Promise<Notam[]> {
    const notams: Notam[] = [];

    // check local storage first
    const localNotams = LocalStoreService.notamsGet(airportCode)
    if (localNotams.length > 0) {
        // console.debug('[AirportDataService.getNotams] using local notams for ' + airportCode)
        return localNotams
    }
    const url = UrlService.root + 'notams/' + airportCode;
    await currentUser.getUrl(url)
        .then(response => {
            // console.log( '[data.requestOneAirport] received', JSON.stringify(response.data))
            notams.push(...response.data)

            // save this data in local storage
            if (notams.length > 0) LocalStoreService.notamsAdd(airportCode, notams)
        })
        .catch(error => {
            reportError('[AirportDataService.getNotams] error ' + JSON.stringify(error))
        })
    return notams;
}

export async function getMetar(airportCode: string): Promise<Metar | null> {
    // Check local storage first
    const localMetar = LocalStoreService.metarGet(airportCode);
    if (localMetar) {
        return localMetar;
    }

    const url = UrlService.root + 'metar/' + airportCode;
    return await currentUser.getUrl(url)
        .then(response => {
            const metar = response.data;
            if (metar) {
                LocalStoreService.metarAdd(airportCode, metar);
            }
            return metar;
        })
        .catch(error => {
            // report the error if it's not a 404
            if (error.response && error.response.status != 404) {
                reportError('[AirportDataService.getMetar] error ' + JSON.stringify(error))
            }
            return null;
        })
}
