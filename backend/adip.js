const axios = require('axios')

const basicAuth = 'Basic 3f647d1c-a3e7-415e-96e1-6e8415e6f209-ADIP'
const modelVersion = 5

async function fetchAirport(code) {
    // console.log( 'ADIP fetching ' + code);

    let locId = null
    // if the code is 4 digits, try to turn it into locId
    if( code.length == 4) {
        // console.log( 'ADIP fetching locId for ' + code);
        await axios.post(
            'https://adip.faa.gov/agisServices/api/nq',
            { query: "autoLookupPublicAirportList", param1: code},
            { 
                headers:{ 
                'Authorization': basicAuth,
                "Content-Type": 'application/json'
            },
        })
        .then( response => {
            // console.log( JSON.stringify(response.data))
            locId = response.data[0].locId
            // console.log( "ADIP locId found " + locId)
        })
        .catch( error => {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              }
        })
        }

    let airport = null
    await axios.post(
        'https://adip.faa.gov/agisServices/public-api/getAirportDetails',
        '{ "locId": "' + (locId == null ? code : locId) + '" }',
        { 
            headers:{ 
            'Authorization': basicAuth,
            "Content-Type": "text/plain"      
        },
    })
    .then( response => {
        // console.log( JSON.stringify(response.data))
        airport = getAirport( response.data)
        airport['fetchTime'] = Date.now();
        // console.log( JSON.stringify(airport))
    })
    .catch( error => {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
    })
    return airport;
}


function getTpa(from) {
    return Math.round(from  + 1000)
}

// 16E => -16
function getVariation( adip) {
    if( 'magneticVariation' in adip) {
        let output = parseInt(adip.magneticVariation.substring(0, adip.magneticVariation.length - 1))
        if(adip.magneticVariation.slice(-1) =='E') {
            output = -output;
        }
        return output
    } else {
        return 0
    }
}

// pattern for surfaceCondition is (G) for Good
function getSurface( rwy) {
    let rwyType = '?'
    let rwyCondition = '?'
    if( 'surfaceType' in rwy) {
        rwyType = rwy.surfaceType
        rwyCondition = rwy.surfaceCondition.substring(1, 2)
    } else if( 'surfaceTypeCondition' in rwy) {
        rwyType = rwy.surfaceTypeCondition
        rwyCondition = rwy.surfaceTypeCondition
    }

    return {'type':rwyType, 'condition':rwyCondition}
}

/**
 * Extract frequency from the rest of the field data
 * Example : "117.7 ;ARR-NE"
*/
function getFrequency(freq) {
    let output = null
    if(freq.includes(' ;')) {
        output = freq.split(" ;")[0]
    } else {
        output = freq
    }
    return output
}

function getGround( adip) {
    let output = null
    if( 'facility' in adip && 'frequencies' in adip.facility) {
        adip.facility.frequencies.some( freq => {
            if(freq.frequencyUse.includes('GND/P')) {
                const candidate = getFrequency(freq.frequency)
                if( isNotMilitary( candidate)) {
                    output = candidate
                    return true
                }
            }
        })
    }
    return output
}

// capitalize first letter of each word for airport name
function getName( name) {
    let words = name.split(' ')
    for (let i = 0; i < words.length; i++) {
        words[i] = words[i][0].toUpperCase() + words[i].substr(1).toLowerCase();
    }
    // console.log( words)
    return words.join(' ')
}

function getRunway( input, magneticVariation) {
    let output = {}
    let orientation = 0
    if( 'trueHeading' in input) {
        orientation = input.trueHeading + magneticVariation
    } else {
        if(input.runwayEndId =='NE') {
            orientation = 45
        } else if(input.runwayEndId =='SE') {
            orientation = 135
        } else if(input.runwayEndId =='SW') {
            orientation = 225
        } else if(input.runwayEndId =='NW') {
            orientation = 315
        } else {
            orientation = parseInt(input.runwayEndId) * 10
        }
    }
    output['orientation'] = orientation
    output['pattern'] = 'rightHandTrafficFlag' in input && input.rightHandTrafficFlag == "YES" ? 'right' : 'left'

    return output
}

function getRunwayFrequency(adip, identifier) {
    let output = null
    if( 'facility' in adip && 'frequencies' in adip.facility) {
        const candidates = adip.facility.frequencies
            .filter( freq => freq.frequency.includes(identifier))
            .map(freq => getFrequency(freq.frequency))
            .filter(freq => isNotMilitary(freq))
        if(candidates.length > 0) {
            output = candidates[0]
        }
    }
    return output
}

/**
 * Figure out of this airport has a tower
 * @param {*} adip 
 * @returns Y or N
 */
function getTower(adip) {
    let output = 'N'
    if( 'facility' in adip && 'facilityType' in adip.facility && adip.facility.facilityType == 'ATCT') {
        output = 'Y'
    }
    return output
}

/**
 * Figure out weather type and frequency
 * @param {*} adip 
 * @returns {'freq':frequency,'type':type} with frequency in MHz and type
 */
function getWeather(adip) {
    let type = 'n/a'
    let frequency = '-.-'
    if( 'facility' in adip && 'frequencies' in adip.facility) {
        adip.facility.frequencies.forEach( freq => {
            if(freq.frequencyUse.includes('ATIS')) {
                const candidate = getFrequency(freq.frequency)
                if( isNotMilitary(candidate)) {
                    frequency = candidate
                    type = freq.frequencyUse
                }
            }
        })
    }
    // second chance with ASOS
    if(type == 'n/a' && 'asosAwos' in adip && 'frequency' in adip.asosAwos[0]) {
        frequency = adip.asosAwos[0].frequency;
        type = adip.asosAwos[0].sensorType;
    }
    return {'freq':frequency,'type':type}
}

function getAirport( adip) {
    var data = {}
    if('locId' in adip){
        data['locId'] = adip.locId
        data['code'] = adip.locId
    }
    if( 'icaoId' in adip) {
        data['icaoId'] = adip.icaoId
        data['code'] = adip.icaoId
    }

    data['name'] = getName(adip.name)
    data['ctaf'] = adip.ctaf
    data['twr'] = getTower(adip)
    data['gnd'] = getGround(adip)
    data['elev'] = adip.elevation
    data['tpa'] = getTpa(adip.elevation)
    data['weather'] = getWeather(adip)
    data['effectiveDate'] = adip.effectiveDate
    data['version'] = modelVersion;

    data['rwy'] = []
    adip.runways.forEach( (rwy) => {
        let runway = {}
        let magneticVariation = getVariation(adip)
        runway['name'] = rwy.runwayIdentifier.replace('/','-')
        runway['length'] = rwy.length
        runway['width'] = rwy.width
        runway['surface'] = getSurface(rwy)
        let runwayFrequency = getRunwayFrequency(adip, rwy.runwayIdentifier)
        if( runwayFrequency != null) {
            runway['freq'] = runwayFrequency
        }
        runway[rwy.baseEnd.runwayEndId] = getRunway( rwy.baseEnd, magneticVariation)
        runway[rwy.reciprocalEnd.runwayEndId] = getRunway( rwy.reciprocalEnd, magneticVariation)
        data['rwy'].push( runway)
    })

    return data
}

function isNotMilitary(freq) {
    return Number(freq) < 225
}


module.exports = { fetchAirport, getTpa, getAirport, getFrequency, getVariation, getName, isNotMilitary, modelVersion }
