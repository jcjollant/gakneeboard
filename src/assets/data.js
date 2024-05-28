export const version = '527'
const apiRootUrl = 'https://ga-api-seven.vercel.app/'
// const apiRootUrl = 'http://localhost:3000/'
// const apiRootUrl = 'https://ga-api-git-google-auth-jcjollants-projects.vercel.app/'

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

const miniHeader = { headers: {'Content-Type':null} }

let currentUser = null
export async function authenticate( source, token) {
  const url = apiRootUrl + 'authenticate'
  const response = await axios.post(url, {source:source, token:token}, miniHeader)
    .catch( e => {
      console.log( '[data.authenticate] ' + e)
      return null
    })
  currentUser = response.data
  return currentUser
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
    const code = codeParam.toUpperCase()

    // console.log( '[data.getAirport] ' + code);
    let airport = null

    // weed out incomplete or invalid codes
    if( !code || code.length < 3 || code.length > 4) {
        // console.log( '[data.getAirport] invalid code ' + code)
        return airport
    }

    // is this a test?
    if( code == '???') {
      // wait 5 seconds
      await new Promise(r => setTimeout(r, 5000));
      return null
    }

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
    pendingCodes.push(code)

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
      while( pendingCodes[0] != code) {
        // console.log( [data.getAirport] 'waiting for ' + pendingQueries[0])
        await new Promise(r => setTimeout(r, 100));
      }

      airport = await requestOneAirport( code)

      // remove ourselves from the first position in the queue
      pendingCodes.shift()
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

/**
 * Request a list of airports by code
 * @param {*} codes 
 * @returns 
 */
async function requestAllAirports( codes) {
  // console.log( 'perform group request for ' + codes.length)
  if( codes.length == 1) {
    return requestOneAirport(codes[0])
  }

  const url = apiRootUrl + 'airports/' + codes.join('-');
  await axios.get(url)
    .then( response => {
        // console.log( JSON.stringify(response.data))
        const airportList = response.data
        airportList.forEach( airport => {
          // memorize this airport
          airports[airport.code] = airport
          // remove this code from pending codes
          pendingCodes.splice( pendingCodes.indexOf(airport.code), 1)
        })
    })
    .catch( error => {
      // this request failed, cache all airports as invalid
      codes.forEach( code => {
        airports[code] = null
      })
      console.log( 'requestAllAirports error ' + error)
    })
}

/**
 * Perform the API request for a single airport code
 * @param {*} code 
 * @returns 
 */
async function requestOneAirport( code) {
  // console.log( pendingCodes.length + " queries in the queue")
  let airport = null

  const url = apiRootUrl + 'airport/';
  await axios.get(url + code)
    .then( response => {
        // console.log( JSON.stringify(response.data))
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

export async function sendFeedback(data) {
  axios.post(apiRootUrl + 'feedback', data, miniHeader)
    .then( response => {
      // console.log( '[data] feedback sent')
    })
    .catch( error => {
      console.log( '[data] feedback error ' + error)
    })
}

export function setCurrentUser( user) {
  currentUser = user
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
