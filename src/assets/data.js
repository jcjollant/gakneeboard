export const version = 5070

const apiRootUrl = GApiUrl.root

import axios from 'axios'
import { Airport } from '../model/Airport.ts'
import { Backend } from './Backend.ts'
import { CurrentUser } from './CurrentUser.ts'
import { GApiUrl } from '../lib/GApiUrl.ts'
import { SessionAirports } from './SessionAirports.ts'
import { LocalStore } from '../lib/LocalStore.ts'
import { NavlogQueue } from './NavlogQueue.ts'

export const contentTypeJson = { headers: {'Content-Type':'application/json'} }
// const contentTypeTextPlain = { headers: {'Content-Type':'text/plain'} }
const contentType = contentTypeJson;
let pendingCodes = []
let sunlightCache = {}
export const backend = new Backend()
export const currentUser = new CurrentUser()
export const navlogQueue = new NavlogQueue()
export const sessionAirports = new SessionAirports()

function airportCurrent( airport) {
  if( !backend.ready && !airport) return false;
  // console.log('[data.airportCurrent', airport.asof, backend.airportEffectiveDate)
  const dateMatch = airport.asof && backend.airportEffectiveDate && airport.asof == backend.airportEffectiveDate
  const modelMatch = airport.version && backend.airportModelVersion && airport.version == backend.airportModelVersion
  // console.log( '[data.airportCurrent] ' + airport.code + ' ' + dateMatch + ' ' + modelMatch )
  return dateMatch && modelMatch;
}

// Payload should look like {source:'google',token:'some.token'}
export async function authenticationRequest( payload) {
  return new Promise( (resolve, reject) => {
    const url = apiRootUrl + 'authenticate'
    axios.post(url, payload, contentTypeJson)
      .then( response => {
        // remove unknown airports because some may be due to unauhtenticated user
        sessionAirports.cleanUp()

        currentUser.login( response.data)
        resolve(currentUser)
      })
      .catch( e => {
        reportError( '[data.authenticate] ' + JSON.stringify(e))
        reject(e)
      })
  })
}

export function duplicate(source) {
  return JSON.parse( JSON.stringify(source))
}

/**
 * Add user information to request header if user is known
 * @param {*} url 
 * @returns 
 */
export async function getUrlWithUser(url) {
  // console.log('[data.getUrlWithUser]', JSON.stringify(currentUser))
  if( currentUser.loggedIn) {
    return axios.get(url,{params:{user:currentUser.sha256}})
  } else {
    return axios.get(url)
  }
}

/**
 * Query airport data backend
 * @param {*} codeParam airport code, case doesn't matter
 * @param {*} group whether this request should be grouped with others
 * @returns airport data
 */
export async function getAirport( codeParam, group = false) {
    // console.log('[data.getAirport]', codeParam)
    if(!codeParam) return null;
    const code = codeParam.toUpperCase()

    // console.log( '[data.getAirport]', code);
    let airport = null

    // weed out incomplete or invalid codes
    if( !Airport.isValidCode( code)) {
        // console.log( '[data.getAirport] invalid code ' + code)
        return airport
    }

    // do we already have this airport in memory?
    if(code in sessionAirports.data) {
      // return value may by null if the code was not found
      return sessionAirports.get(code)
    }

    // if this code is already in the queue we'll just wait for the data
    if( pendingCodes.includes(code)) {
      // console.log( '[data.getAirport] already in queue ' + code)
      return await waitForAirportData( code)
    }

    try {
      const localAirport = LocalStore.airportGet(code)
      // we have local airport information
      if( backend.ready) {
        if( airportCurrent( localAirport)) {
          // console.log('[data.getAirport] localAirport ', code, 'is current')
          // Airport data is current add to session airports and return it
          sessionAirports.set(code, localAirport)
          // console.log('[data.getAirport] localAirport ', code, 'is current')
          return localAirport;
        }
      }
      // Either airport data is stale or backend is not ready
      // Add a promise to the localAirport that will return investigation outcome
      localAirport.promise = new Promise( async(resolve) => {
        // if backend is ready this will resolve immediately
        await backend.promise.then( () => {
          // compare effective date and model version
          if( airportCurrent(localAirport)) {
            sessionAirports.set(code, localAirport)
            // console.log('[data.getAirport] localAirport ', code, 'was current')
            resolve({current:true,airport:localAirport})
          } else {
            // turn out this data was stale, remove it from localStorage
            LocalStore.airportRemove(code)
            getAirport(code, false).then(airport => {
              sessionAirports.set(code, airport)
              resolve({current:false,airport:airport})
            }).catch( (e) => {
              reportError('[data.getAirport] error getting new airport data' + JSON.stringify(e))
              resolve({current:false,airport:null})
            })
          }
        })

      })
      // we return stale airport with promise
      return localAirport;
    } catch(e) {
      // no local copy
    }

    // add ourselves to the list of pending queries
    // console.log( '[data.getAirport] adding to queue', code);
    pendingCodes.push(code)
    // console.log( '[data.getAirport]', code, 'enqueued', JSON.stringify(pendingCodes));

    if( group) {
      // Are we still getting new queries?
      const beforeCount = pendingCodes.length
      await new Promise(r => setTimeout(r, 500));

      if( beforeCount == pendingCodes.length) { // no queries withing the last 500 ms
        // go ahead and place the query
        await requestAllAirports( pendingCodes)
      }
      airport = await waitForAirportData( code)

    } else { // grouping is not allowed

      // wait until the current code is in first position
      while( pendingCodes.length > 0 && pendingCodes[0] != code) {
        // console.log( '[data.getAirport] waiting for', pendingCodes[0], pendingCodes.length, maxWait)
        await new Promise(r => setTimeout(r, 1000));
      }

      // Request that one code
      airport = await requestOneAirport( code)

      // remove ourselves from the first position in the queue
      pendingCodes.shift()
      // console.log( '[data.getAirport]', code, 'removed from queue', JSON.stringify(pendingCodes))
    }

    // save this data in local storage
    // console.log('[data.getAirport] saving to localStorage', code)
    LocalStore.airportAdd(code,airport)

    return airport
}

/**
 * Request backend information such as version and current effective date
 * @returns 
 */
export async function getBackend() {
  backend.promise = new Promise( (resolve) => {
    getUrlWithUser(apiRootUrl)
      .then( response => {
        // console.log('[data.getBackend]', JSON.stringify(response.data))
        if( !response || !response.data) {
          resolve(null)
        } else {
          backend.version = Number(response.data.version)
          backend.airportEffectiveDate = Number(response.data.aced)
          backend.airportModelVersion = Number(response.data.camv)
          backend.ready = true;
          // console.log('[data.getBackend] ready')

          // Do we have anything about the user?
          if( response.data.user) {
            currentUser.update( response.data.user)
          } else {
            currentUser.logout()
          }

          resolve(backend)
        }
      })
      .catch( error => {
        reportError( '[data.getBackend] error' + error)
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
  return freqList.find( f => f.name.includes(name))
}

export function getFreqCtaf(freqList) {
  return getFrequency(freqList, 'CTAF')
}

export function getFreqGround(freqList) {
  return getFrequency(freqList, 'GND')
}

/**
 * Look for a weather frequency in the list
 * @param {*} freqList 
 * @returns corresponding frequency object (with name and mhz)
 */
export function getFreqWeather(freqList) {
  // match names that containt either 'ATIS', 'ASOS' or 'AWOS'
  return freqList.find( f => f.name.includes('ATIS') 
    || f.name.includes('ASOS') 
    || f.name.includes('AWOS')
    || f.name.includes('Weather')
  )
}

/**
 * Request maintenance with a code
 * @param {*} code 
 */
export async function getMaintenance(code) {
  return new Promise( (resolve, reject) => {
    const url = apiRootUrl + 'maintenance/' + code
    axios.get(url).then( response => {
        // console.log('[data.getMaintenance]', JSON.stringify(response.data))
        if( typeof response.data === 'object' && 'sha256' in response.data) {
          currentUser.login( response.data)
        }
        resolve()
      }).catch( error => {
        // reportError('[data.getMaintenance] error ' + JSON.stringify(error))
        reject()
      })
  })
}

export function getNavaid(navaidList, id) {
  return navaidList.find( n => n.id == id)
}


/**
 * Get sunlight data
 * @param {*} from 
 * @param {*} to 
 * @param {*} date 
 * @returns 
 */
export async function getSunlight( from, to=null, date=null, night=false) {
  if( !from) return null; // we need at least the from code
  if( !date) date = new Date() // today if not specified
  if( !to) to = from // default to same airport
  const dateFrom = getSunlightDate(date)
  let params = from + '/' + to + '/' + dateFrom;
  if( night) { 
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    params += '/' + getSunlightDate(nextDay)
  }
  // do we already have that data?
  if( params in sunlightCache) {
    // console.log('[data.getSunlight] found cache hit')
    return sunlightCache[params]
  }

  let url = apiRootUrl + 'sunlight/' + params
  return axios.get( url)
    .then( response => {
      sunlightCache[params] = response.data
      return response.data
    })
    .catch( error => {
      reportError( '[data.getSunlight] error ' + JSON.stringify(error))
      return null
    })
}

function getSunlightDate(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

export async function postPrint(options) {
  const url = apiRootUrl + 'print'
  return axios.post(url, options, contentTypeJson)
    .then( response => {
      return response.data
    })
    .catch( error => {
      reportError( '[data.postPrint] error ' + JSON.stringify(error))
      return null
    })
}

export function reportError(message) {
  // we are just printing in the console for now but eventually we want to report
  console.log(message);
}

/**
 * Request a list of airports by code
 * @param {*} codes 
 * @returns 
 */
async function requestAllAirports( codes) {
  // console.log( 'perform group request for ' + codes.length)
  const url = apiRootUrl + 'airports/' + codes.join('-');
  await getUrlWithUser(url)
    .then( response => {
        // console.log( JSON.stringify(response.data))
        const airportList = response.data
        airportList.forEach( airport => {
            // memorize this airport
            sessionAirports.set(airport.code, airport)
            // remove this code from pending codes
            pendingCodes.splice( pendingCodes.indexOf(airport.code), 1)
            // console.log('[data.requestAllAirports]', airport.code,'removed',JSON.stringify(pendingCodes))
        })
    })
    .catch( error => {
      // this request failed, cache all airports as invalid
      codes.forEach( code => {
        sessionAirports.setInvalid( code)
      })
      reportError( '[data.requestAllAirports] error ' + JSON.stringify(error))
    })
}

/**
 * Perform the API request for a single airport code
 * @param {*} code 
 * @returns 
 */
async function requestOneAirport( code) {
  // console.log( '[data.requestOneAirport]', code)
  let airport = null

  const url = apiRootUrl + 'airport/' + code;
  await getUrlWithUser(url)
    .then( response => {
        // console.log( '[data.requestOneAirport] received', JSON.stringify(response.data))
        airport = response.data
        // add this data to cache
        sessionAirports.set(code, airport)
        // console.log( 'added to cache ' + code)
    })
    .catch( error => {
      // cache this airport as invalid
      sessionAirports.setInvalid( code)
      pendingCodes = []
    })

  return airport
}

export function routeToLocalTemplate(router, template) {
    LocalStore.saveTemplate(template)
    router.push('/template/local')
}


/**
 * Send feedback to the backend with version and follow up flag
 * @param {*} text feedback text
 * @param {*} contactMe boolean
 */
export async function sendFeedback(text,contactMe=true) {
  // console.log( '[data] feedback ' + JSON.stringify(data))
  const url = apiRootUrl + 'feedback'
  const payload = {version:version,feedback:text}
  if( contactMe) {
    payload.user = currentUser.sha256;
  }

  axios.post( url, payload, contentTypeJson)
  // axios.post( url, JSON.stringify(payload), contentTypeTextPlain)
    .then( response => {
      // console.log( '[data] feedback sent')
    })
    .catch( error => {
      reportError( '[data.sendFeedback] error ' + JSON.stringify(error))
    })
}

/**
 * Our data has already been requested, we are waiting for it
 * @param {*} code 
 * @returns 
 */
async function waitForAirportData( code) {
  // console.log( 'waiting for ' + code) 
  while( !(code in sessionAirports.data)) {
    await new Promise(r => setTimeout(r, 250));
  }
  // console.log( 'done waiting for ' + code)
  return sessionAirports.get(code)
}

export async function saveCustomAirport(airport) {
  const url = apiRootUrl + 'airport'
  const payload = {user:currentUser.sha256, airport:airport}
  await axios.post( url, payload, contentType)
    .then( response => {
      // console.log( '[data] custom airport saved', airport.code)
    })
    .catch( error => {
      reportError( '[data.saveCustomAirport] custom airport save error ' + JSON.stringify(error))
    })

}