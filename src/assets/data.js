export const version = '725-2'
export const blogUrl = 'https://gakneeboard.wordpress.com/'
// export const blogUrl = 'https://ga-kneeboard.blogspot.com/'
const apiRootUrl = 'https://ga-api-seven.vercel.app/'
// const apiRootUrl = 'http://localhost:3000/'
// const apiRootUrl = 'https://ga-api-git-google-auth-jcjollants-projects.vercel.app/'
// const apiRootUrl = 'https://ga-api-git-custom-airports-jcjollants-projects.vercel.app/'
import { Airport } from './Airport.ts'
import axios from 'axios'

export const sheetNameDemo = 'default-demo'
export const sheetNameReset = 'default-reset'
export const sheetNameLocal = 'page1'

const demoRadioData = [
  {'target':'NAV1','freq':'116.8','name':'SEA VOR'},
  {'target':'NAV2','freq':'113.4','name':'OLM VOR'},
  {'target':'COM1','freq':'124.7','name':'RNT TWR'},
  {'target':'COM2','freq':'126.95','name':'RNT ATIS'},
  {'target':'COM1','freq':'123.0','name':'S43 CTAF'},
  {'target':'COM2','freq':'128.65','name':'PAE ATIS'},
  {'target':'COM1','freq':'120.2','name':'PAE TWR 34R'},
  {'target':'COM1','freq':'132.95','name':'PAE TWR 34L'}
]
 const demoSheet = [
  {'id':0,'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
  {'id':1,'name':'airport','data':{'code':'kbfi','rwy':'14L-32R'}},
  {'id':2,'name':'airport','data':{'code':'w39','rwy':'NE-SW','rwyOrientation':'magnetic'}},
  {'id':3,'name':'airport','data':{'code':'O26','rwy':'13-31'}},
  {'id':4,'name':'atis','data':{}},
  {'id':5,'name':'clearance','data':{}},
  {'id':6,'name':'airport','data':{'code':'ktta','rwy':'03-21','pattern':2}},
  {'id':7,'name':'airport','data':{'code':'kawo','rwy':'all'}},
  {'id':8,'name':'sunlight','data':{'from':'KRNT','to':'KSFF'}},
  {'id':9,'name':'fuel'},
  {'id':10,'name':'notes','data':{}},
  {'id':11,'name':'radios','data':demoRadioData},
]

 const blankSheet = [
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

const contentTypeJson = { headers: {'Content-Type':'application/json'} }
const contentTypeTextPlain = { headers: {'Content-Type':'text/plain'} }
const contentType = contentTypeJson;
let currentUser = null
let airports = {}
let pendingCodes = []

export async function authenticate( source, token) {
  const url = apiRootUrl + 'authenticate'
  const payload = {source:source, token:token}
  const response = await axios.post(url, payload, contentTypeJson)
    .catch( e => {
      console.log( '[data.authenticate] ' + e)
      return null
    })
  // remove unknown airports because some may be due to unauhtenticated user
  for( const code in airports) {
    if( airports[code] == null) {
      delete airports[code]
    }
  }

  setCurrentUser(response.data)
  return currentUser
}

/**
 * Add user information to request header if user is known
 * @param {*} url 
 * @returns 
 */
async function axiosGetForUser(url) {
  if( currentUser) {
    return axios.get(url,{params:{user:currentUser.sha256}})
  } else {
    return axios.get(url)
  }
}

/**
 * Delete custom sheet
 * @param {*} sheet 
 */
export async function customSheetDelete(sheet) {
  const url = apiRootUrl + 'sheet/' + sheet.id
  if( !currentUser) {
    throw new Error('Cannot delete sheet without user')
  }
  await axios.delete(url,{params:{user:currentUser.sha256}})
    .then( response => {
      // console.log('[data.customSheetDelete] sheet deleted', sheet.id)
      currentUser.sheets = currentUser.sheets.filter( s => s.id != sheet.id)
      return sheet
    })
    .catch( error => {
      console.log('[data.customSheetDelete] error ' + JSON.stringify(error))
      return null
    })
}

/**
 * Save custom sheet to the backend
 * @param {*} name 
 * @param {*} data 
 * @returns Created sheet on success or null on failure
 */
export async function customSheetSave(sheet) {
  const url = apiRootUrl + 'sheet'
  if( !currentUser) {
    throw new Error('Cannot save sheet without user')
  }
  if( sheet.name in [sheetNameDemo, sheetNameReset, sheetNameLocal]) {
    throw new Error('Sheet name conflicts with defaults')
  }
  const payload = {user:currentUser.sha256, sheet:sheet}
  await axios.post(url, payload, contentTypeJson)
    .then( response => {
      const responseSheet = response.data
      // console.log('[data.customSheetSave] sheet saved', sheet, responseSheet)
      // update that sheet in currentUser.sheets if it exists
      let index = -1
      if( sheet.id != 0 && currentUser.sheets.length > 0) {
        index = currentUser.sheets.findIndex( s => s.id == sheet.id)
        // console.log('[data.customSheetSave] index', index)
      }
      if( index == -1) {
        currentUser.sheets.push(responseSheet)
      } else {
        // update existing entry
        currentUser.sheets[index].name = sheet.name
        currentUser.sheets[index].data = sheet.data
      }
      userSortSheets()
      return sheet
    })
    .catch( error => {
      console.log('[data.customSheetSave] error ' + JSON.stringify(error))
      return null
    })
}

export function formatMhz(mhz) {
    if( !mhz) return '-.-'
    return Number(mhz).toFixed(3)
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
        // console.log( '[data.getAirport] waiting for', pendingCodes[0], pendingCodes.length, maxWait)
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
 * @returns a copy of blank sheet data
 */
export function getBlankSheet() {
  return JSON.parse( JSON.stringify(blankSheet))
}  

/**
 * @returns Whatever the current user is. Could be null if user is not authenticated
 */
export function getCurrentUser() {
  return currentUser
}

/**
 * @returns a copy of demo sheet data 
 */
export function getDemoSheet() {
  return JSON.parse( JSON.stringify(demoSheet))
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
  let url = apiRootUrl + 'sunlight/' + from + '/' + to + '/' + dateFrom
  if( night) { 
    const nextDay = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    url += '/' + getSunlightDate(nextDay)
  }
  return axios.get( url)
    .then( response => {
      return response.data
    })
    .catch( error => {
      console.log( '[data.getSunlight] error ' + JSON.stringify(error))
      return null
    })
}

function getSunlightDate(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
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
  await axiosGetForUser(url)
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
  await axiosGetForUser(url)
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

  axios.post( url, payload, contentTypeJson)
  // axios.post( url, JSON.stringify(payload), contentTypeTextPlain)
    .then( response => {
      // console.log( '[data] feedback sent')
    })
    .catch( error => {
      console.log( '[data] feedback error ' + JSON.stringify(error))
    })
}

/**
 * Memorize the current user and refresh all sheets if requested
 * @param {*} user 
 * @param {*} refreshSheets 
 */
export function setCurrentUser( user, refreshSheets=false) {
  // console.log('[data.setCurrentUser]', JSON.stringify(user), refreshSheets)
  currentUser = user
  if( currentUser && refreshSheets) {
    // request sheets after waiting 2 seconds
    setTimeout( () => {
      // console.log( '[data.setCurrentUser] refreshing sheets')
      const url = apiRootUrl + 'sheets'
      axiosGetForUser(url).then( sheets => {
        const newSheets = sheets.data;
        // console.log( '[data.setCurrentUser] sheets received', JSON.stringify(sheets), 'difference=>', newSheets != currentUser.sheets)
        if( newSheets != currentUser.sheets) {
          currentUser.sheets = sheets.data;
          // console.log( '[data.setCurrentUser] sheets count', currentUser.sheets.length)
          userSortSheets()
        }
      })
      }, 2000)
  }
}

/**
 * 
 * @returns Sorts sheets for a user
 */
function userSortSheets() {
  if(!currentUser || !currentUser.sheets || !currentUser.sheets.length) return
  currentUser.sheets.sort( (a,b) => a.name.localeCompare(b.name))
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
//  await axios.post( url, JSON.stringify(payload), contentTypeTextPlain)
  await axios.post( url, payload, contentType)
    .then( response => {
      // console.log( '[data] custom airport saved', airport.code)
    })
    .catch( error => {
      console.log( '[data] custom airport save error ' + error)
    })

}
