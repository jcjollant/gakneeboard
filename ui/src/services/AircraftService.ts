import axios from 'axios'
import { contentTypeJson, currentUser, reportError } from '../assets/data.js'
import { UrlService } from './UrlService'
import { Aircraft } from '@gak/shared'

export class AircraftService {
    static async list(): Promise<Aircraft[]> {
        const url = UrlService.aircrafts()
        return currentUser.getUrl(url)
            .then(response => response.data)
            .catch(error => {
                reportError('[AircraftService.list] error ' + error)
                return []
            })
    }

    static async listTemplates(): Promise<Aircraft[]> {
        const url = UrlService.aircraftTemplates()
        return axios.get(url)
            .then(response => response.data)
            .catch(error => {
                reportError('[AircraftService.listTemplates] error ' + error)
                return []
            })
    }

    static async getByTailNumber(tailNumber: string): Promise<Partial<Aircraft> | null> {
        const url = UrlService.aircraft(tailNumber)
        return currentUser.getUrl(url)
            .then(response => response.data)
            .catch(error => {
                if (error.response && error.response.status === 404) return null
                reportError('[AircraftService.getByTailNumber] error ' + error)
                return null
            })
    }

    static async save(aircraft: Partial<Aircraft> & { tailNumber: string, data: any }): Promise<Aircraft | null> {
        const url = UrlService.aircraft()
        if (!currentUser.loggedIn) {
            throw new Error('Cannot save aircraft without user')
        }
        const payload = { 
            user: currentUser.sha256, 
            ...aircraft 
        }
        return axios.post(url, payload, contentTypeJson)
            .then(response => response.data)
            .catch(error => {
                reportError('[AircraftService.save] error ' + error)
                return null
            })
    }

    static async delete(id: number): Promise<boolean> {
        const url = UrlService.aircraft(id)
        if (!currentUser.loggedIn) {
            throw new Error('Cannot delete aircraft without user')
        }
        return axios.delete(url, { params: { user: currentUser.sha256 } })
            .then(() => true)
            .catch(error => {
                reportError('[AircraftService.delete] error ' + error)
                return false
            })
    }
}
