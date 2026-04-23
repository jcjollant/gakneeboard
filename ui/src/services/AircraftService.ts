import axios from 'axios'
import { contentTypeJson, currentUser, reportError } from '../assets/data.js'
import { UrlService } from './UrlService'
import { Aircraft } from '@gak/shared'
import { LocalStoreService } from './LocalStoreService'

export class AircraftService {
    static wasFetchedThisSession = false

    static async list(): Promise<Aircraft[]> {
        const local = LocalStoreService.getAircrafts()
        if (local && local.length > 0) {
            // Trigger background fetch to update cache, but return local data immediately
            this.fetchAndStoreAircrafts().catch(() => {})
            return local
        }
        return this.fetchAndStoreAircrafts()
    }

    private static async fetchAndStoreAircrafts(): Promise<Aircraft[]> {
        const url = UrlService.aircrafts()
        return currentUser.getUrl(url)
            .then(response => {
                const aircrafts = response.data
                LocalStoreService.saveAircrafts(aircrafts)
                this.wasFetchedThisSession = true
                return aircrafts
            })
            .catch(error => {
                reportError('[AircraftService.list] error ' + error)
                return []
            })
    }

    static async listTemplates(): Promise<Aircraft[]> {
        const local = LocalStoreService.getAircraftTemplates()
        if (local && local.length > 0) {
            this.fetchAndStoreTemplates().catch(() => {})
            return local
        }
        return this.fetchAndStoreTemplates()
    }

    private static async fetchAndStoreTemplates(): Promise<Aircraft[]> {
        const url = UrlService.aircraftTemplates()
        return axios.get(url)
            .then(response => {
                const templates = response.data
                LocalStoreService.saveAircraftTemplates(templates)
                return templates
            })
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
            .then(response => {
                LocalStoreService.clearAircraftCache()
                return response.data
            })
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
            .then(() => {
                LocalStoreService.clearAircraftCache()
                return true
            })
            .catch(error => {
                reportError('[AircraftService.delete] error ' + error)
                return false
            })
    }
}
