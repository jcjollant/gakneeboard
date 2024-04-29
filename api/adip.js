import axios from 'axios'


export async function fetch( code) {
    // console.log( 'ADIP fetching ' + code);
    let airport = null
    await axios.post('https://adip.faa.gov/agisServices/public-api/getAirportDetails',
    '{ "locId": "' + code + '" }',
    { 
    headers:{ 
        'Authorization':'Basic 3f647d1c-a3e7-415e-96e1-6e8415e6f209-ADIP',
        "Content-Type": "text/plain"      
    },
    })
    .then( response => {
        // console.log( JSON.stringify(response.data))
        airport = fromAdip( response.data)
        // console.log( JSON.stringify(airport))
    })
    .catch( error => {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          }
    })
    return airport
}

function getTpa(from) {
    return Math.round(from / 100) * 100 + 1000
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

// split frequency from the rest of the field data
// Example : "117.7 ;ARR-NE"
function getFrequency(freq) {
    let output = null
    if(freq.includes(' ;')) {
        output = freq.split(" ;")[0]
    } else {
        output = freq
    }
    return output
}

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
        adip.facility.frequencies.forEach( freq => {
            // pattern is "120.2 ;RWY 16L/34R"
            if(freq.frequency.includes(identifier)) {
                output = getFrequency(freq.frequency)
            }
        })
    }
    return output
}

function getTower(adip) {
    let output = 'N'
    if( 'facility' in adip && 'facilityType' in adip.facility && adip.facility.facilityType == 'ATCT') {
        output = 'Y'
    }
    return output
}

function getWeather(adip) {
    let type = 'n/a'
    let frequency = '-.-'
    if( 'facility' in adip && 'frequencies' in adip.facility) {
        adip.facility.frequencies.forEach( freq => {
            // frequencyUse can be ATIS or D-ATIS (KJFK)
            if(freq.frequencyUse.includes('ATIS')) {
                frequency = getFrequency(freq.frequency)
                type = freq.frequencyUse
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

export function fromAdip( adip) {
    var data = {}
    var uniqueCode = ''
    if( 'icaoId' in adip) {
        uniqueCode = adip.icaoId
    } else if('locId' in adip){
        uniqueCode = adip.locId
    } else {
        // console.error('No unique code found in ' + JSON.stringify(adip))
    }

    data['code'] = uniqueCode.toUpperCase()
    data['name'] = getName(adip.name)
    data['ctaf'] = adip.ctaf
    data['twr'] = getTower(adip)
    data['elev'] = adip.elevation
    data['tpa'] = getTpa(adip.elevation)
    data['weather'] = getWeather(adip)

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
