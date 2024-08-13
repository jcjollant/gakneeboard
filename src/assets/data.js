export const version = '812-2'
export const maxSheetCount = 10
export const keyUser = 'kb-user'
const apiRootUrl = 'https://ga-api-seven.vercel.app/'
//const apiRootUrl = 'http://localhost:3000/'
// const apiRootUrl = 'https://ga-api-git-google-auth-jcjollants-projects.vercel.app/'
// const apiRootUrl = 'https://ga-api-git-custom-airports-jcjollants-projects.vercel.app/'
export const urlBlog = 'https://gakneeboard.wordpress.com/'
export const urlGuideAirport = 'https://gakneeboard.wordpress.com/2024/07/28/airport-tile-guide/'
export const urlGuideAtis = 'https://gakneeboard.wordpress.com/2024/07/29/atis-tile-guide/'
export const urlGuideChecklist = 'https://gakneeboard.wordpress.com/2024/08/06/checklist-syntax-guide/'
export const urlGuideFuelBug = 'https://gakneeboard.wordpress.com/2024/07/30/fuel-bug-tile-guide/'
export const urlGuideRadioFlow = 'https://gakneeboard.wordpress.com/2024/08/03/radio-flow-tile-guide/'
export const urlGuideSunlight = 'https://gakneeboard.wordpress.com/2024/08/10/sunlight-tile-guide/'
export const urlKneeboard = 'https://kneeboard.ga'
import { Airport } from './Airport.ts'
import axios from 'axios'
import { isDefaultName, normalizeSheetData } from './sheetData.js'


const contentTypeJson = { headers: {'Content-Type':'application/json'} }
// const contentTypeTextPlain = { headers: {'Content-Type':'text/plain'} }
const contentType = contentTypeJson;
let currentUser = null
let airports = {}
let pendingCodes = []
export let backendVersion = null
export let currentAirportEffectiveDate = null
let effectiveDatePromise = null

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

  currentUser = response.data

  return currentUser
}

export function duplicate(source) {
  return JSON.parse( JSON.stringify(source))
}

/**
 * Add user information to request header if user is known
 * @param {*} url 
 * @returns 
 */
async function getUrlWithUser(url) {
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
  if( isDefaultName(sheet.name)) {
    throw new Error('Sheet name conflicts with defaults')
  }
  const payload = {user:currentUser.sha256, sheet:sheet}
  return axios.post(url, payload, contentTypeJson)
    .then( response => {
      const responseSheet = response.data
      // we don't need the data
      responseSheet.data = []
      // console.log('[data.customSheetSave] sheet saved', JSON.stringify(responseSheet))
      // update that sheet in currentUser.sheets if it exists
      let index = -1
      if( sheet.id != 0 && currentUser.sheets.length > 0) {
        index = currentUser.sheets.findIndex( s => s.id == sheet.id)
        // console.log('[data.customSheetSave] index', index)
      }
      // add new sheet or update existing sheet
      if( index == -1) {
        currentUser.sheets.push(responseSheet)
      } else {
        // update existing entry
        currentUser.sheets[index] = responseSheet;
        // currentUser.sheets[index].name = sheet.name
        // currentUser.sheets[index].data = sheet.data
      }
      userSortSheets()
      return responseSheet
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

    // do we already have this airport in memory?
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

    // do we already have this airport in localStorage?
    const localStorageKey = 'airport-' + code;
    const localCopy = localStorage.getItem(localStorageKey)
    if(localCopy) {
      // we have local airport information
      const localAirport = JSON.parse( localCopy)
      // console.log('[data.getAirport] local', JSON.stringify(localAirport.asof), 'cead', currentAirportEffectiveDate)
      if(localAirport.asof && localAirport.asof == currentAirportEffectiveDate) {
        // airport data is current
        return localAirport;
      } else if( !currentAirportEffectiveDate){
        // we cannot tell if airport data is current, wait for caed
        // pass a promise that returns the investigation outcome
        localAirport.promise = new Promise( resolve => {
          effectiveDatePromise.then( (caed) => {
            if(caed != localAirport.asof) {
              // turn out this data was stale, remove ir from localStorage
              // console.log('[data.getAirport] caed is not current for', code, 'removing from localStorage')
              localStorage.removeItem(localStorageKey)
              getAirport(code, false).then(airport => {
                resolve({current:false,airport:airport})
              }).catch( (e) => {
                // console.log('[data.getAirport] error getting new airport data', e)
                resolve({current:false,airport:null})
              })
            } else { // dates match
              // console.log('[data.getAirport] caed is current')
              resolve({current:true,airport:localAirport})
            }
          })

        })
        return localAirport;
      }
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
    localStorage.setItem(localStorageKey, JSON.stringify(airport))

    return airport
}

/**
 * Request backend information such as version and current effective date
 * @returns 
 */
export async function getBackend() {
  // console.log('[data.getBackend]')
  // create new promise until we have effective date
  effectiveDatePromise = new Promise( (resolve) => {
    let retries = 5
    const interval = setInterval( () => {
      // console.log('[data.getBackend] waiting for effective date', retries)
      if( currentAirportEffectiveDate || !retries) {
        clearInterval(interval)
        resolve( currentAirportEffectiveDate ? currentAirportEffectiveDate : null)
        return
      }
      --retries;
    }, 500)
  })

  // Actually get the data
  return axios.get( apiRootUrl)
    .then( response => {
      // console.log('[data.getBackend]', JSON.stringify(response.data))
      backendVersion = response?.data?.version
      currentAirportEffectiveDate = response?.data?.aced

      return response.data
    })
    .catch( error => {
      console.log( '[data.getBackend] error', JSON.stringify(error))
      return null
    })
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
  await getUrlWithUser(url)
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
  await getUrlWithUser(url)
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
 */
export function setCurrentUser( user) {
  // console.log('[data.setCurrentUser]', JSON.stringify(user))
  currentUser = user
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

/**
 * Gets a sheet from its publication code
 * @param {*} code 
 * @returns 
 */
export async function sheetGetByCode(code) {
  const url = apiRootUrl + 'sheetByCode/' + code
  return axios.get( url)
    .then( response => response.data)
    .catch( error => {
      console.log( '[data.sheetGetByCode] error ' + JSON.stringify(error))
      return null
    })

}

export async function sheetGetById(id) {
  const url = apiRootUrl + 'sheet/' + id
  return getUrlWithUser(url).then( response => {
    // console.log('[data.sheetGetById]', JSON.stringify(response))
    const sheet = response.data;
    sheet.data = normalizeSheetData(sheet.data)
    return sheet;
  }).catch( error => {
      if(error.response.status != 404) {
        console.log( '[data.sheetGetById] error ' + error)
      }
      return null
    })
}

export async function sheetGetList() {
  const url = apiRootUrl + 'sheets'
  return getUrlWithUser(url).then( response => {
    currentUser.sheets = response.data;
    userSortSheets()
    return currentUser.sheets;
  })
  .catch( error => {
    console.log( '[data.sheetGetList] error ' + error)
    return null
  })

}