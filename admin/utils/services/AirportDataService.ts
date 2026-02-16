import type { AirportCreationRequest } from '../models/AirportCreationRequest'
import { UrlService } from '../UrlService'
import { api } from '../api'

const contentType = { headers: { 'Content-Type': 'application/json' } }

export async function createAirport(request: AirportCreationRequest) {
    const url = UrlService.adminRoot + 'airport'
    const payload = { user: "", request: request }
    // console.debug('[AirportDataService.createAirport] payload', payload)
    await api.post(url, payload, contentType)
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
