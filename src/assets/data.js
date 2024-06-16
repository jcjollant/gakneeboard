export const version = '615'
// const apiRootUrl = 'https://ga-api-seven.vercel.app/'
const apiRootUrl = 'http://localhost:3000/'
// const apiRootUrl = 'https://ga-api-git-google-auth-jcjollants-projects.vercel.app/'
import { Airport } from './Airport.ts'
import axios from 'axios'

const demoRadioData = [
  {'target':'NAV1','freq':'116.8','name':'SEA VOR'},
  {'target':'NAV2','freq':'124.7','name':'OLM VOR'},
  {'target':'COM1','freq':'124.7','name':'RNT TWR'},
  {'target':'COM2','freq':'126.95','name':'RNT ATIS'},
  {'target':'COM1','freq':'123.0','name':'S43 CTAF'},
  {'target':'COM2','freq':'128.65','name':'PAE ATIS'},
  {'target':'COM1','freq':'120.2','name':'PAE TWR 34R'},
  {'target':'COM1','freq':'132.95','name':'PAE TWR 34L'}
]
 const demoPage = [
  {'id':0,'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
  {'id':1,'name':'airport','data':{'code':'kbfi','rwy':'14L-32R'}},
  {'id':2,'name':'airport','data':{'code':'w39','rwy':'NE-SW'}},
  {'id':3,'name':'airport','data':{'code':'O26','rwy':'13-31'}},
  {'id':4,'name':'atis','data':{}},
  {'id':5,'name':'clearance','data':{}},
  {'id':6,'name':'airport','data':{'code':'ktta','rwy':'03-21','pattern':2}},
  {'id':7,'name':'airport','data':{'code':'kawo','rwy':'all'}},
  {'id':8,'name':'airport','data':{'code':'s43','rwy':'15R-33L','rwyOrientation':'magnetic'}},
  // {'id':9,'name':'airport','data':{'code':'s50','rwy':'16-34','pattern':4}},
  {'id':9,'name':'fuel'},
  {'id':10,'name':'notes','data':{}},
  {'id':11,'name':'radios','data':demoRadioData},
]

 const blankPage = [
  {'id':0,'name':'','data':{}},
  {'id':1,'name':'','data':{}},
  {'id':2,'name':'','data':{}},
  {'id':3,'name':'','data':{}},
  {'id':4,'name':'','data':{}},
  {'id':5,'name':'','data':{}},
  {'id':6,'name':'','data':{}},
  {'id':7,'name':'','data':{}},
  {'id':8,'name':'','data':{}},
  {'id':9,'name':'','data':{}},
  {'id':10,'name':'','data':{}},
  {'id':11,'name':'','data':{}},
]  

// const contentTypeJson = { headers: {'Content-Type':'application/json'} }
const contentTypeTextPlain = { headers: {'Content-Type':'text/plain'} }
// const contentTypeText = { headers: {'Content-Type':'text'} }

let currentUser = null
export async function authenticate( source, token) {
  const url = apiRootUrl + 'authenticate'
  const payload = {source:source, token:token}
  const response = await axios.post(url, JSON.stringify(payload), contentTypeTextPlain)
    .catch( e => {
      console.log( '[data.authenticate] ' + e)
      return null
    })
  setCurrentUser(response.data)
  return currentUser
}

/**
 * Add user information to request header if user is known
 * @param {*} url 
 * @returns 
 */
async function axiosGet(url) {
  if( currentUser) {
    return axios.get(url,{params:{user:currentUser.sha256}})
  } else {
    return axios.get(url)
  }
}

let airports = {}
let pendingCodes = []
/**
 * Query airport data backend
 * @param {*} codeParam airport code, case doesn't matter
 * @param {*} group whether this request should be grouped with others
 * @returns airport data
 */
export async function getAirport( codeParam, group = false) {
    // console.log('[data.getAirport]', codeParam)
    const code = codeParam.toUpperCase()

    // console.log( '[data.getAirport]', code);
    let airport = null

    // weed out incomplete or invalid codes
    if( !Airport.isValidCode( code)) {
        // console.log( '[data.getAirport] invalid code ' + code)
        return airport
    }

    // is this a test?
    // if( code == '???') {
    //   // wait 5 seconds
    //   await new Promise(r => setTimeout(r, 5000));
    //   return null
    // }

    // do we already know this code in the cache?
    if( code in airports) {
        airport = airports[code]
        // console.log( '[data.getAirport] found in cache ' + code)
        return airport
    }

    // if this code is already in the queue we'll just wait for the data
    if( pendingCodes.includes(code)) {
      // console.log( '[data.getAirport] already in queue ' + code)
      return await waitForAirportData( code)
    }

    // add ourselves to the list of pending queries
    // console.log( '[data.getAirport] adding to queue', code);
    pendingCodes.push(code)
    // console.log( '[data.getAirport]', code, 'enqueued', JSON.stringify(pendingCodes));

    if( group) {
      // wait until there are no more queries
      const beforeCount = pendingCodes.length
      await new Promise(r => setTimeout(r, 500));
      const afterCount = pendingCodes.length
      if( beforeCount == afterCount) { // no queries withing the last 500 ms
        await requestAllAirports( pendingCodes)
      }
      airport = await waitForAirportData( code)
      // remove ourselves from the list of pending queries
      // pendingCodes.splice( pendingCodes.indexOf(code), 1)

    } else { // grouping is not allowed

      // wait until we are in first position
      while( pendingCodes.length > 0 && pendingCodes[0] != code) {
        console.log( '[data.getAirport] waiting for', pendingCodes[0], pendingCodes.length)
        await new Promise(r => setTimeout(r, 1000));
      }

      airport = await requestOneAirport( code)

      // remove ourselves from the first position in the queue
      pendingCodes.shift()
      // console.log( '[data.getAirport]', code, 'removed from queue', JSON.stringify(pendingCodes))
    }

    return airport
  }

/**
 * @returns a copy of blank page data
 */
export function getBlankPage() {
  return JSON.parse( JSON.stringify(blankPage))
}  

/**
 * @returns Whatever the current user is. Could be null if user is not authenticated
 */
export function getCurrentUser() {
  return currentUser
}

/**
 * @returns a copy of demo page data 
 */
export function getDemoPage() {
  return JSON.parse( JSON.stringify(demoPage))
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
 * We have better data for a given airport code. For example when we are done editing
 * @param {*} code 
 * @param {*} data 
 */
export function refreshAirport(code, data) {
  airports[code] = data
}

/**
 * Request a list of airports by code
 * @param {*} codes 
 * @returns 
 */
async function requestAllAirports( codes) {
  // console.log( 'perform group request for ' + codes.length)
  const url = apiRootUrl + 'airports/' + codes.join('-');
  await axiosGet(url)
    .then( response => {
        // console.log( JSON.stringify(response.data))
        const airportList = response.data
        airportList.forEach( airport => {
            // memorize this airport
            airports[airport.code] = airport
            // remove this code from pending codes
            pendingCodes.splice( pendingCodes.indexOf(airport.code), 1)
            // console.log('[data.requestAllAirports]', airport.code,'removed',JSON.stringify(pendingCodes))
        })
    })
    .catch( error => {
      // this request failed, cache all airports as invalid
      codes.forEach( code => {
        airports[code] = null
      })
      console.log( '[data.requestAllAirports] error ', error)
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
  await axiosGet(url)
    .then( response => {
        // console.log( '[data.requestOneAirport] received', JSON.stringify(response.data))
        airport = response.data
        // add this data to cache
        airports[code] = airport
        // console.log( 'added to cache ' + code)
    })
    .catch( error => {
      // cache this airport as invalid
      airports[code] = null
      pendingCodes = []
    })

  return airport
}

/**
 * Send feedback to the backend with version and follow up flag
 * @param {*} text feedback text
 * @param {*} contactMe boolean
 */
export async function sendFeedback(text,contactMe) {
  // console.log( '[data] feedback ' + JSON.stringify(data))
  const url = apiRootUrl + 'feedback'
  const payload = {version:version,feedback:text}
  if( contactMe) {
    payload.user = currentUser.sha256;
  }

  axios.post( url, JSON.stringify(payload), contentTypeTextPlain)
  // axios.post(apiRootUrl + 'feedback', data, contentTypeJson)
    .then( response => {
      // console.log( '[data] feedback sent')
    })
    .catch( error => {
      console.log( '[data] feedback error ' + JSON.stringify(error))
    })
}

export function setCurrentUser( user) {
  currentUser = user
  // axios.defaults.headers.common['Authorization'] = 'User ' + user.sha256;
}

/**
 * Our data has already been requested, we are waiting for it
 * @param {*} code 
 * @returns 
 */
async function waitForAirportData( code) {
  // console.log( 'waiting for ' + code) 
  while( !(code in airports)) {
    await new Promise(r => setTimeout(r, 250));
  }
  // console.log( 'done waiting for ' + code)
  return airports[code]
}

export async function saveCustomAirport(airport) {
  const url = apiRootUrl + 'airport'
  const payload = {user:currentUser.sha256, airport:airport}
  // const headers = { 'Content-Type':'text/plain', 'Authorization':'Bearer ' + currentUser.sha256}
  await axios.post( url, JSON.stringify(payload), contentTypeTextPlain)
    .then( response => {
      // console.log( '[data] custom airport saved', airport.code)
    })
    .catch( error => {
      console.log( '[data] custom airport save error ' + error)
    })

}
