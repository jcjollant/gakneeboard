export const version = '430'
const apiRootUrl = 'https://ga-api-seven.vercel.app/'
// const apiRootUrl = 'http://localhost:3000/'



import axios from 'axios'

export const demoRadioData = [
  {'target':'NAV1','freq':'116.8','name':'SEA VOR'},
  {'target':'NAV2','freq':'124.7','name':'OLM VOR'},
  {'target':'COM1','freq':'124.7','name':'RNT TWR'},
  {'target':'COM2','freq':'126.95','name':'RNT ATIS'},
  {'target':'COM1','freq':'123.0','name':'S43 CTAF'},
  {'target':'COM2','freq':'128.65','name':'PAE ATIS'},
  {'target':'COM1','freq':'120.2','name':'PAE TWR 34R'},
  {'target':'COM1','freq':'132.95','name':'PAE TWR 34L'}
]

export const demoPage = [
  {'id':0,'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
  {'id':1,'name':'airport','data':{'code':'s36','rwy':'15-33'}},
  {'id':2,'name':'airport','data':{'code':'w39','rwy':'NE-SW'}},
  {'id':3,'name':'airport','data':{'code':'kplu','rwy':'17-35'}},
  {'id':4,'name':'atis','data':{}},
  {'id':5,'name':'clearance','data':{}},
  {'id':6,'name':'airport','data':{'code':'kbvs','rwy':'11-29'}},
  {'id':7,'name':'airport','data':{'code':'kawo','rwy':'11-29'}},
  {'id':8,'name':'airport','data':{'code':'s43','rwy':'15R-33L'}},
  {'id':9,'name':'airport','data':{'code':'kpae','rwy':'16L-34R'}},
  {'id':10,'name':'radios','data':demoRadioData},
  {'id':11,'name':'notes','data':{}},
]

export const blankPage = [
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

let airports = {}
let pendingCodes = []

// get a list of airports in one pass
export async function preloadAirports(codes) {
    console.log( 'preloadAirports ' + JSON.stringify(codes))

    // filter out those we already know
    const newCodes = codes.filter( code => {
      return !((code in airports) || pendingCodes.includes(code)) 
    })

    // TODO: Remove
    // Artifically adds all airports in the cache to prevent further requests
    newCodes.forEach( code => {
      airports[code] = {'data':''}
    })

    // if we don't have anything left, we stop here
    if( newCodes.length == 0) return;

    console.log( 'fetching airports ' + JSON.stringify(newCodes))

    const url = apiRootUrl + 'airports/';
    axios.post(url, JSON.stringify(newCodes))
      .then( response => {
          // console.log( JSON.stringify(response.data))
          airportList = response.data
          airportList.forEach( airport => {
            // reply should be a list of codes and data
            // [{'code':'xyz','data':{...}}]
            airports[airport.code] = airport.data
          })
      })
      .catch( error => {
        console.log( 'error ' + error)
      })
}

export async function getOneAirport( code) {
    // console.log( 'fetching ' + code);
    let airport = null

    if( !code || code.length < 3 || code.length > 4) {
        // console.log( 'invalid code ' + code)
        return null
    }

    // do we already know this code?
    if( code in airports) {
        airport = airports[code]
        // console.log( 'found in cache ' + code)
        return airport
    }

    // is this code already in the queue?
    if( pendingCodes.includes(code)) {
      // console.log( 'already in queue ' + code)
      while( !(code in airports)) {
        // console.log( 'waiting for ' + pendingQueries[0])
        await new Promise(r => setTimeout(r, 500));
      }
      return airports[code]
    }

    // add ourselves to the list of pending queries
    pendingCodes.push(code)

    while( pendingCodes[0] != code) {
      // console.log( 'waiting for ' + pendingQueries[0])
      await new Promise(r => setTimeout(r, 250));
    }

    // console.log( pendingCodes.length + " queries in the queue")

    const url = apiRootUrl + 'airport/';
    await axios.get(url + code)
      .then( response => {
          // console.log( JSON.stringify(response.data))
          airport = response.data
          // memorize for next pass
          airports[code] = airport
          // console.log( 'added to cache ' + code)
      })
      .catch( error => {
        // save this code as invalid
        airports[code] = null
      })
      pendingCodes.shift()
      return airport
}
  

  var testCount = 0;
function testKeyInSource(key, source, code) {
  testCount++;
  if( !(key in source)) console.log( key +' missing from ' + JSON.stringify[source] + ' at ' + code);

}
function testRunway(rwy, rwys, code) {
  testKeyInSource(rwy, rwys, code);
  // test this runway has an orientation and pattern
  testKeyInSource('orientation', rwys[rwy], code);
  testKeyInSource('pattern', rwys[rwy], code);
  const pattern = rwys[rwy]['pattern'];
  if( pattern != 'left' && pattern != 'right') console.log('pattern value ' + pattern + ' is invalid for runway ' + rwy + ' at ' + code)
}
export function validate() {
  testCount = 0;
  Object.keys(airports).forEach((code)=>{
    // console.log('validating ' + code);
    // we want all the essential fields
    testKeyInSource('code', airports[code], code);
    testKeyInSource('name', airports[code], code);
    testKeyInSource('elev', airports[code], code);
    testKeyInSource('tpa', airports[code], code);
    testKeyInSource('weather', airports[code], code);
    // testKeyInSource('ctaf', airports[code], code);
    testKeyInSource('rwy', airports[code], code);
    // traffic pattern consistency
    if( airports[code].tpa - airports[code].elev > 1100) console.log('traffic pattern is too high at ' + code);
    if( airports[code].tpa - airports[code].elev < 900) console.log('traffic pattern is too low at ' + code);
    // test weather has a frequency and a type
    testKeyInSource('freq', airports[code].weather, code);
    testKeyInSource('type', airports[code].weather, code);
    // test runways are all showing up
    airports[code].rwy.forEach((rwys)=>{
      testKeyInSource('name', rwys, code);
      testKeyInSource('length', rwys, code);
      testKeyInSource('surface', rwys, code);
      testKeyInSource('type', rwys['surface'], code);
      testKeyInSource('condition', rwys['surface'], code);
      var [rwyA,rwyB] = rwys.name.split('-');
      // test each runway has an entry
      testRunway(rwyA, rwys, code);
      testRunway(rwyB, rwys, code);
    })
  })
  console.log('Airport data validation complete ' + testCount + ' tests ' + Object.keys(airports).length + ' airports')
}

