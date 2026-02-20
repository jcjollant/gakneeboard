import { version } from '../../package.json'
export { version }
export const eulaVersion = 20250821
import axios from 'axios'
import { reactive } from 'vue'

// import { Backend } from './Backend.ts'
import { CurrentUser } from './CurrentUser.ts'
import { UrlService } from '../services/UrlService.ts'
import { SessionAirports } from './SessionAirports.ts'
import { LocalStoreService } from '../services/LocalStoreService.ts'
import { AttributionService } from '../services/AttributionService.ts'
import { NavlogQueue } from './NavlogQueue.ts'

export const contentTypeJson = { headers: { 'Content-Type': 'application/json' } }
// const contentTypeTextPlain = { headers: {'Content-Type':'text/plain'} }
const contentType = contentTypeJson;

let sunlightCache = {}

const INITIAL_BACKEND_STATE = {
  version: '',
  promise: null,
  airportModelVersion: 0,
  airportEffectiveDate: 0,
  ready: false
}

export const backend = reactive(INITIAL_BACKEND_STATE)
export const currentUser = new CurrentUser()
export const navlogQueue = new NavlogQueue()
export const sessionAirports = new SessionAirports()



// Payload should look like {source:'google',token:'some.token'}
export async function authenticationRequest(payload) {
  return new Promise((resolve, reject) => {
    const url = UrlService.root + 'authenticate'

    // Add attribution data if available
    const attribution = AttributionService.getAttribution()
    if (attribution) {
      payload.attribution = attribution
    }

    axios.post(url, payload, contentTypeJson)
      .then(response => {
        // remove unknown airports because some may be due to unauhtenticated user
        sessionAirports.cleanUp()

        currentUser.login(response.data)
        resolve(currentUser)
      })
      .catch(e => {
        reportError('[data.authenticate] ' + JSON.stringify(e))
        reject(e)
      })
  })
}

export function duplicate(source) {
  return JSON.parse(JSON.stringify(source))
}



/**
 * Request backend information such as version and current effective date
 * @returns 
 */
export async function getBackend() {
  backend.promise = new Promise((resolve) => {
    currentUser.getUrl(UrlService.root + '?version=' + version)
      .then(response => {
        // console.log('[data.getBackend]', JSON.stringify(response.data))
        if (!response || !response.data) {
          resolve(null)
        } else {
          backend.version = response.data.version
          backend.airportEffectiveDate = Number(response.data.aced)
          backend.airportModelVersion = Number(response.data.camv)
          backend.ready = true;
          // console.log('[data.getBackend] ready')

          // Do we have anything about the user?
          if (response.data.user) {
            currentUser.update(response.data.user)
          } else {
            currentUser.logout()
          }

          resolve(backend)
        }
      })
      .catch(error => {
        reportError('[data.getBackend] ' + error)
        resolve(null)
      })
  })

  // Actually get the data
  return backend.promise
}

/**
 * @returns Whatever the current user is. Could be null if user is not authenticated
 */
export function getCurrentUser() {
  return currentUser
}

export function getFrequency(freqList, name) {
  return freqList.find(f => f.name.includes(name))
}

/**
 * Request maintenance with a code
 * @param {*} code 
 */
export async function getMaintenance(code) {
  return new Promise((resolve, reject) => {
    const url = UrlService.root + 'maintenance/' + code
    axios.get(url).then(response => {
      // console.log('[data.getMaintenance]', JSON.stringify(response.data))
      if (typeof response.data === 'object' && 'sha256' in response.data) {
        currentUser.login(response.data)
      }
      resolve()
    }).catch(error => {
      // reportError('[data.getMaintenance] error ' + JSON.stringify(error))
      reject()
    })
  })
}

export function getNavaid(navaidList, id) {
  return navaidList.find(n => n.id == id)
}

/**
 * Get sunlight data
 * @param {*} from 
 * @param {*} to 
 * @param {*} date 
 * @returns 
 */
export async function getSunlight(from, to = null, date = null, night = false) {
  if (!from) return null; // we need at least the from code
  if (!date) date = new Date() // today if not specified
  if (!to) to = from // default to same airport
  const dateFrom = getSunlightDate(date)
  let params = from + '/' + to + '/' + dateFrom;
  if (night) {
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    params += '/' + getSunlightDate(nextDay)
  }
  // do we already have that data?
  if (params in sunlightCache) {
    // console.log('[data.getSunlight] found cache hit')
    return sunlightCache[params]
  }

  let url = UrlService.root + 'sunlight/' + params
  return axios.get(url)
    .then(response => {
      sunlightCache[params] = response.data
      return response.data
    })
    .catch(error => {
      reportError('[data.getSunlight] error ' + JSON.stringify(error))
      return null
    })
}

function getSunlightDate(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

export async function postEula() {
  const url = UrlService.root + 'eula'
  const config = { headers: { 'Content-Type': 'application/json', 'user': currentUser.sha256 } }
  const payload = { version: eulaVersion }
  return axios.post(url, payload, config)
    .then(response => {
      return response.data
    })
    .catch(error => {
      reportError('[data.postEula] error ' + JSON.stringify(error))
      return null
    })
}


export async function postPrint(id, options) {
  const url = UrlService.root + 'print'
  const config = { headers: { 'Content-Type': 'application/json', 'user': currentUser.sha256 } }
  const payload = { template: Number(id), options: options }
  return axios.post(url, payload, config)
    .then(response => {
      return response.data
    })
    .catch(error => {
      reportError('[data.postPrint] error ' + JSON.stringify(error))
      return null
    })
}

export function reportError(message) {
  // we are just printing in the console for now but eventually we want to report
  console.error(message);
}



export function routeToLocalTemplate(router, template) {
  LocalStoreService.saveTemplate(template)
  router.push('/template/local')
}


/**
 * Send feedback to the backend with version and follow up flag
 * @param {*} text feedback text
 * @param {*} contactMe boolean
 */
export async function sendFeedback(text, contactMe = true) {
  // console.log( '[data] feedback ' + JSON.stringify(data))
  const url = UrlService.root + 'feedback'
  const payload = { version: version, feedback: text, user: currentUser.sha256, contact: contactMe }

  axios.post(url, payload, contentTypeJson)
    // axios.post( url, JSON.stringify(payload), contentTypeTextPlain)
    .then(response => {
      // console.log( '[data] feedback sent')
    })
    .catch(error => {
      reportError('[data.sendFeedback] error ' + JSON.stringify(error))
    })
}


