export const version = '428'

import axios from 'axios'

export const demoPage = [
  {'id':0,'name':'airport','data':{'code':'krnt','rwy':'16-34'}},
  {'id':1,'name':'airport','data':{'code':'s36','rwy':'15-33'}},
  {'id':2,'name':'airport','data':{'code':'w39','rwy':'NE-SW'}},
  {'id':3,'name':'airport','data':{'code':'kplu','rwy':'17-35'}},
  {'id':4,'name':'atis','data':{}},
  {'id':5,'name':'notes','data':{}},
  {'id':6,'name':'airport','data':{'code':'kbvs','rwy':'11-29'}},
  {'id':7,'name':'airport','data':{'code':'kawo','rwy':'11-29'}},
  {'id':8,'name':'airport','data':{'code':'s43','rwy':'15R-33L'}},
  {'id':9,'name':'airport','data':{'code':'kpae','rwy':'16L-34R'}},
  {'id':10,'name':'atis','data':{}},
  {'id':11,'name':'atis','data':{}},
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

// let oldAirports = {
//     "0s9":{"code":"0S9","name":"Jefferson County Intl","ctaf":"123.000","twr":"N","elev":110.1,"tpa":1100,"weather":{"freq":119.025,"type":"AWOS-3P"},"rwy":[{"27":{"orientation":268,"pattern":"left"},"name":"09-27","length":3000,"width":75,"surface":{"type":"ASPH","condition":"E"},"09":{"orientation":88,"pattern":"right"}}]},
//     "13w":{"code":"13W","name":"Camano Island Airfield","ctaf":"122.900","twr":"N","elev":145,"tpa":1100,"weather":{"freq":132.775,"type":"AWOS-3"},"rwy":[{"16":{"orientation":159,"pattern":"right"},"34":{"orientation":-21,"pattern":"right"},"name":"16-34","length":1750,"width":24,"surface":{"type":"ASPH","condition":"F"}}]},
//     "21w":{"code":"21W","name":"Ranger Creek","ctaf":"122.900","elev":2650,"tpa":3700,"weather":{"freq":"-.-","type":"n/a"},"rwy":[{"15":{"orientation":145,"pattern":"left"},"33":{"orientation":325,"pattern":"left"},"name":"15-33","length":2875,"width":30,"surface":{"type":"ASPH","condition":"F"}}]},
//     "2s9":{"code":"2S9","name":"Willapa Harbor","ctaf":"122.900","twr":"N","elev":13,"tpa":1000,"weather":{"freq":135.775,"type":"ASOS"},"rwy":[{"11":{"orientation":110,"pattern":"left"},"29":{"orientation":290,"pattern":"left"},"name":"11-29","length":3005,"width":52,"surface":{"type":"ASPH","condition":"G"}}]},
//     "4w0":{"code":"4W0","name":"Bandera State","ctaf":"122.900","twr":"N","elev":1636,"tpa":2600,"weather":{"freq":135.275,"type":"ASOS"},"rwy":[{"26":{"orientation":260,"pattern":"left"},"name":"08-26","length":2344,"width":100,"surface":{"type":"TURF","condition":"F"},"08":{"orientation":80,"pattern":"left"}}]},
//     "8w5":{"code":"8W5","name":"Apex Airpark","ctaf":"122.800","twr":"N","elev":525,"tpa":1500,"weather":{"freq":121.2,"type":"AWOS-3PT"},"rwy":[{"17":{"orientation":170,"pattern":"left"},"35":{"orientation":350,"pattern":"right"},"name":"17-35","length":2500,"width":28,"surface":{"type":"ASPH","condition":"F"}}]},
//     "kawo":{"code":"KAWO","name":"Arlington Muni","ctaf":"122.725","elev":141.8,"tpa":1100,"weather":{"freq":135.625,"type":"AWOS-3PT"},"rwy":[{"11":{"orientation":110,"pattern":"right"},"29":{"orientation":290,"pattern":"left"},"name":"11-29","length":3498,"width":75,"surface":{"type":"ASPH","condition":"E"}},{"16":{"orientation":162,"pattern":"right"},"34":{"orientation":342,"pattern":"left"},"name":"16-34","length":5332,"width":100,"surface":{"type":"ASPH","condition":"E"}}]},
//     "kcls":{"code":"KCLS","name":"Chehalis-centralia","ctaf":"122.800","twr":"N","elev":177.2,"tpa":1200,"weather":{"freq":118.025,"type":"AWOS-3"},"rwy":[{"16":{"orientation":162,"pattern":"right"},"34":{"orientation":342,"pattern":"left"},"name":"16-34","length":5000,"width":140,"surface":{"type":"CONC","condition":"G"}}]},
//     "kbfi":{"code":"KBFI","name":"Boeing Fld/king County Intl","elev":21.6,"tpa":1000,"weather":{"freq":"127.75","type":"ATIS"},"rwy":[{"name":"14L-32R","length":3709,"width":100,"surface":{"type":"ASPH","condition":"F"},"freq":"118.3","14L":{"orientation":135,"pattern":"left"},"32R":{"orientation":315,"pattern":"right"}},{"name":"14R-32L","length":10007,"width":200,"surface":{"type":"ASPH","condition":"G"},"freq":"120.6","14R":{"orientation":135,"pattern":"right"},"32L":{"orientation":315,"pattern":"left"}}]},
//     "kbvs":{"code":"KBVS","name":"Skagit Rgnl","ctaf":"123.075","elev":145.1,"tpa":1100,"weather":{"freq":121.125,"type":"AWOS-3"},"rwy":[{"22":{"orientation":220,"pattern":"left"},"name":"04-22","length":3000,"width":60,"surface":{"type":"ASPH","condition":"P"},"04":{"orientation":40,"pattern":"left"}},{"11":{"orientation":110,"pattern":"left"},"29":{"orientation":290,"pattern":"left"},"name":"11-29","length":5480,"width":100,"surface":{"type":"ASPH","condition":"E"}}]},
//     "keln":{"code":"KELN","name":"Bowers Fld","ctaf":"123.000","elev":1763.2,"tpa":2800,"weather":{"freq":"-.-","type":"n/a"},"rwy":[{"11":{"orientation":117,"pattern":"left"},"29":{"orientation":297,"pattern":"left"},"name":"11-29","length":4300,"width":150,"surface":{"type":"CONC","condition":"G"}}]},
//     "kemt":{"code":"KEMT","name":"San Gabriel Valley","ctaf":"121.200","twr":"Y","elev":295.6,"tpa":1300,"weather":{"freq":"118.75","type":"ATIS"},"rwy":[{"19":{"orientation":191,"pattern":"right"},"name":"01-19","length":3995,"width":75,"surface":{"type":"ASPH","condition":"G"},"01":{"orientation":11,"pattern":"left"}}]},
//     "kfhr":{"code":"KFHR","name":"Friday Harbor","ctaf":"128.250","twr":"N","elev":112.7,"tpa":1100,"weather":{"freq":135.675,"type":"ASOS"},"rwy":[{"16":{"orientation":161,"pattern":"right"},"34":{"orientation":341,"pattern":"right"},"name":"16-34","length":3402,"width":75,"surface":{"type":"ASPH","condition":"G"}}]},
//     "khqm":{"code":"KHQM","name":"Bowerman","ctaf":"122.700","twr":"N","elev":17.8,"tpa":1000,"weather":{"freq":135.775,"type":"ASOS"},"rwy":[{"24":{"orientation":240,"pattern":"left"},"name":"06-24","length":5000,"width":150,"surface":{"type":"ASPH","condition":"G"},"06":{"orientation":60,"pattern":"right"}}]},
//     "kolm":{"code":"KOLM","name":"Olympia Rgnl","ctaf":"124.400","twr":"Y","elev":207.8,"tpa":1200,"weather":{"freq":"135.725","type":"ATIS"},"rwy":[{"26":{"orientation":269,"pattern":"left"},"name":"08-26","length":4157,"width":150,"surface":{"type":"ASPH","condition":"G"},"08":{"orientation":89,"pattern":"right"}},{"17":{"orientation":176,"pattern":"left"},"35":{"orientation":-4,"pattern":"right"},"name":"17-35","length":5500,"width":150,"surface":{"type":"ASPH","condition":"G"}}]},
//     "kpae":{"code":"KPAE","name":"Seattle Paine Fld Intl","ctaf":"132.950","elev":606.9,"tpa":1600,"weather":{"freq":"128.65","type":"ATIS"},"rwy":[{"name":"16L-34R","length":3004,"width":75,"surface":{"type":"ASPH","condition":"G"},"freq":"120.2","16L":{"orientation":164,"pattern":"left"},"34R":{"orientation":344,"pattern":"right"}},{"name":"16R-34L","length":9010,"width":150,"surface":{"type":"ASPH-CONC","condition":"G"},"freq":"132.95","16R":{"orientation":163,"pattern":"right"},"34L":{"orientation":343,"pattern":"left"}}]},
//     "kplu":{"code":"KPLU","name":"Pierce County - Thun Fld","ctaf":"122.700","elev":537.6,"tpa":1500,"weather":{"freq":128.575,"type":"AWOS-3"},"rwy":[{"17":{"orientation":165,"pattern":"left"},"35":{"orientation":-15,"pattern":"left"},"name":"17-35","length":3651,"width":60,"surface":{"type":"ASPH","condition":"G"}}]},
//     "kpwt":{"code":"KPWT","name":"Bremerton Ntl","ctaf":"123.050","twr":"N","elev":444,"tpa":1400,"weather":{"freq":121.2,"type":"AWOS-3PT"},"rwy":[{"20":{"orientation":197,"pattern":"left"},"name":"02-20","length":6000,"width":150,"surface":{"type":"ASPH","condition":"G"},"02":{"orientation":17,"pattern":"right"}}]},
//     "krnt":{"code":"KRNT","name":"Renton Muni","ctaf":"124.700","twr":"Y","elev":32,"tpa":1000,"weather":{"freq":"126.95","type":"ATIS"},"rwy":[{"16":{"orientation":157,"pattern":"left"},"34":{"orientation":337,"pattern":"right"},"name":"16-34","length":5382,"width":200,"surface":{"type":"ASPH-CONC","condition":"G"}}]},
//     "ksmo":{"code":"KSMO","name":"Santa Monica Muni","ctaf":"120.100","twr":"Y","elev":169.8,"tpa":1200,"weather":{"freq":"119.15","type":"ATIS"},"rwy":[{"21":{"orientation":212,"pattern":"left"},"name":"03-21","length":3500,"width":150,"surface":{"type":"ASPH","condition":"G"},"03":{"orientation":32,"pattern":"right"}}]},
//     "ktiw":{"code":"KTIW","name":"Tacoma Narrows","ctaf":"118.500","twr":"Y","elev":294.8,"tpa":1300,"weather":{"freq":"124.05","type":"ATIS"},"rwy":[{"17":{"orientation":167,"pattern":"left"},"35":{"orientation":-13,"pattern":"right"},"name":"17-35","length":5002,"width":100,"surface":{"type":"ASPH","condition":"G"}}]},
//     "kvny":{"code":"KVNY","name":"Van Nuys","ctaf":"119.300","twr":"Y","elev":802.1,"tpa":1800,"weather":{"freq":"127.55","type":"ATIS"},"rwy":[{"name":"16L-34R","length":4013,"width":75,"surface":{"type":"ASPH","condition":"G"},"freq":"120.2","16L":{"orientation":164,"pattern":"left"},"34R":{"orientation":344,"pattern":"right"}},{"name":"16R-34L","length":8001,"width":150,"surface":{"type":"ASPH","condition":"G"},"freq":"119.3","16R":{"orientation":164,"pattern":"right"},"34L":{"orientation":344,"pattern":"left"}}]},
//     "s36":{"code":"S36","name":"Norman Grier Fld","ctaf":"123.000","elev":472,"tpa":1500,"weather":{"freq":"-.-","type":"n/a"},"rwy":[{"15":{"orientation":150,"pattern":"left"},"33":{"orientation":330,"pattern":"left"},"name":"15-33","length":3288,"width":40,"surface":{"type":"ASPH","condition":"G"}}]},
//     "s43":{"code":"S43","name":"Harvey Fld","ctaf":"123.000","elev":22.8,"tpa":1000,"weather":{"freq":"-.-","type":"n/a"},"rwy":[{"name":"15L-33R","length":2672,"width":36,"surface":{"type":"ASPH","condition":"E"},"15L":{"orientation":148,"pattern":"right"},"33R":{"orientation":328,"pattern":"left"}},{"name":"15R-33L","length":2430,"width":100,"surface":{"type":"TURF","condition":"E"},"15R":{"orientation":148,"pattern":"right"},"33L":{"orientation":328,"pattern":"left"}}]},
//     "s50":{"code":"S50","name":"Auburn Muni","ctaf":"122.975","elev":63,"tpa":1100,"weather":{"freq":"-.-","type":"n/a"},"rwy":[{"16":{"orientation":162,"pattern":"right"},"34":{"orientation":342,"pattern":"left"},"name":"16-34","length":3842,"width":75,"surface":{"type":"ASPH","condition":"G"}}]},
//     "w10":{"code":"W10","name":"Whidbey Air Park","ctaf":"122.900","twr":"N","elev":271,"tpa":1300,"weather":{"freq":"-.-","type":"n/a"},"rwy":[{"16":{"orientation":160,"pattern":"left"},"34":{"orientation":340,"pattern":"left"},"name":"16-34","length":2470,"width":25,"surface":{"type":"ASPH","condition":"G"}}]},
//     "w36":{"code":"W36","name":"Will Rogers Wiley Post Meml","ctaf":"124.700","twr":"N","elev":0,"tpa":1000,"weather":{"freq":126.95,"type":"ASOS"},"rwy":[{"name":"12W-30W","length":5000,"width":200,"surface":{"type":"WATER","condition":"WATER"},"12W":{"orientation":120,"pattern":"right"},"30W":{"orientation":300,"pattern":"left"}}]},
//     "w39":{"code":"W39","name":"Roche Harbor","ctaf":"128.250","twr":"N","elev":0,"tpa":1000,"weather":{"freq":135.675,"type":"ASOS"},"rwy":[{"name":"NE-SW","length":5000,"width":1000,"surface":{"type":"WATER","condition":"WATER"},"NE":{"orientation":45,"pattern":"left"},"SW":{"orientation":225,"pattern":"left"}},{"name":"NW-SE","length":2500,"width":500,"surface":{"type":"WATER","condition":"WATER"},"NW":{"orientation":315,"pattern":"left"},"SE":{"orientation":135,"pattern":"left"}}]},
//   }

let airports = {}
let pendingCodes = []

export async function getAirport( code) {
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

    // const url = 'http://localhost:3000/airport/'
    const url = 'https://ga-api-seven.vercel.app/airport/';
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

