import axios from 'axios'
import { UsageType, UsagePayload } from '@gak/shared'
import { UrlService } from './UrlService'
import { currentUser } from '../assets/data.js'

export class UsageService {
    /**
     * Declare a new usage event to the backend
     * @param type UsageType enum
     * @param data Object containing usage data
     * @returns 
     */
    static async declare(type: UsageType, data: any) {
        const url = UrlService.usage()
        const payload = new UsagePayload(JSON.stringify(data), type)
        const config = { headers: { 'Content-Type': 'application/json', 'user': currentUser.sha256 } }

        return axios.post(url, payload, config)
            .then(response => response.data)
            .catch(error => {
                console.error('[UsageService.declare] error', error)
                throw error
            })
    }
}
