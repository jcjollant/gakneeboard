const gapi = require( '../backend/gapi')

process.env.POSTGRES_URL="postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"


test('Renton is found with both codes', async () => {
    let airport = await gapi.getAirport('RNT')
    expect(airport.code).toBe('KRNT')
    let airport2 = await gapi.getAirport('KRNT')
    expect(airport2.code).toBe('KRNT')
})

test('Getting multiple Airports', async () => {
    let list = ['rnt','jfk']
    let airports = await gapi.getAirportsList(list)
    // console.log(airports)
    expect(airports.length).toBe(list.length)
    expect(airports[0].code).toBe('KRNT')
    expect(airports[1].code).toBe('KJFK')

    let list2 = ['jc','pae','jcj']
    airports = await gapi.getAirportsList(list2)
    expect(airports.length).toBe(list2.length)
    expect(airports[0].code).toBe('JC')
    expect(airports[0].version).toBe(-1)
    expect(airports[1].code).toBe('KPAE')
    expect(airports[1].version).toBe(6)
    expect(airports[2].code).toBe('JCJ')
    expect(airports[2].version).toBe(-1)
})

test('Invalid airports', async() =>{
    let list = ['nt','fk']
    let airports = await gapi.getAirportsList(list)
    // console.log(airports)
    expect(airports.length).toBe(2)
    expect(airports[0].code).toBe('NT')
    expect(airports[0].version).toBe(-1)
    expect(airports[1].code).toBe('FK')
    expect(airports[1].version).toBe(-1)

    expect
})

test('ICAOs are valid', () => {
    expect(gapi.getIcao('KRNTA')).toBeNull()
    expect(gapi.getIcao('KRNT')).toBe('KRNT')
    expect(gapi.getIcao('RNT')).toBe('KRNT')
    expect(gapi.getIcao('NT')).toBeNull()
})

test('locId are valid', () => {
    expect(gapi.getLocId('KRNTA')).toBeNull()
    expect(gapi.getLocId('KRNT')).toBe('RNT')
    expect(gapi.getLocId('krnt')).toBe('RNT')
    expect(gapi.getLocId('S43')).toBe('S43')
    expect(gapi.getLocId('NT')).toBeNull()
})

test('Codes are valid', () => {
    expect(gapi.isValidCode('RNT')).toBe(true)
    expect(gapi.isValidCode('KRNT')).toBe(true)
    expect(gapi.isValidCode('PANN')).toBe(true)
    expect(gapi.isValidCode('LRNT')).toBe(true)
    expect(gapi.isValidCode('KRNT2')).toBe(false)
    expect(gapi.isValidCode('NT')).toBe(false)
})

test('Militrary frequencies', () => {
    expect(gapi.isMilitary(null)).toBe(false)
    expect(gapi.isMilitary('-.-')).toBe(false)
    expect(gapi.isMilitary('')).toBe(false)
    expect(gapi.isMilitary('121.6')).toBe(false)
    expect(gapi.isMilitary('261.6')).toBe(true)
})