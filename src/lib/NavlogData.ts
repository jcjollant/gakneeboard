import axios from 'axios'

import { newCurrentUser } from '../assets/data';
import { NavlogEntry } from '../assets/NavlogEntry';
import { GApiUrl } from './GApiUrl';

export class NavlogData {
    static async uploadFilePlan(file:any):Promise<NavlogEntry[]> {
        const url = GApiUrl.flightPlanToNavlog()
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', newCurrentUser.sha256);
        const headers = { headers: { 'Content-Type': 'multipart/form-data' }};
        const promise:Promise<NavlogEntry[]> = new Promise((resolve, reject) => {
            axios.post(url, formData, headers).then( r => {
                // console.log('[NavlogData.uploadFilePlan]', JSON.stringify(r.data))
                resolve(r.data);
            }).catch( e => {
                reject(e)
            });
        })
        return promise;
    }
}