import axios from 'axios'
import { CurrentUser } from './CurrentUser'
import { GApiUrl } from '../lib/GApiUrl'


export class Checkout {
    static async plan(code:string, user:CurrentUser):Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const url = GApiUrl.root + 'checkout'
            const payload = {user:user.sha256, product:code, source:window.location.href}
            // console.log('[Checkout.plan]', payload)
            const headers = { headers: {'Content-Type':'application/json'} }
            await axios.post(url, payload, headers).then( response => {
                resolve(response.data.url)
            }).catch( error => {
                console.log(error)
                reject('/')
            })
        })
    }
}