import axios from 'axios'
import type { AirportCreationRequest } from '../models/AirportCreationRequest'
import { UrlService } from '../UrlService'
import { currentUser } from '../data'

const contentType = { headers: { 'Content-Type': 'application/json' } }

export async function createAirport(request: AirportCreationRequest) {
    const url = UrlService.adminRoot + 'airport'
    const payload = { user: currentUser.sha256, request: request }
    // console.debug('[AirportDataService.createAirport] payload', payload)
    await axios.post(url, payload, contentType)
        .then(response => {
            // if (response.data && response.data.code) {
            //     sessionAirports.set(response.data.code, response.data)
            // }
        })
        .catch(error => {
            console.error('[AirportDataService.createAirport] error ' + JSON.stringify(error))
            throw error
        })
}
