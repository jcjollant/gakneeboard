const gapi = require( '../datasource/gapi')

process.env.POSTGRES_URL="postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"


test('Renton is found', async () => {
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
    let list2 = ['pae','jc','jcj']
    airports = await gapi.getAirportsList(list2)
    expect(airports.length).toBe(list2.length)
    expect(airports[0].code).toBe('KPAE')
    expect(airports[1]).toBeNull()
    expect(airports[2]).toBeNull()
})

test('invalid airports are null', async() =>{
    let list = ['nt','fk']
    let airports = await gapi.getAirportsList(list)
    // console.log(airports)
    expect(airports.length).toBe(2)
    expect(airports[0]).toBeNull()
    expect(airports[1]).toBeNull()

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
    // 4 chars but doens't start with K or P
    expect(gapi.isValidCode('LRNT')).toBe(false)
    expect(gapi.isValidCode('KRNT2')).toBe(false)
    expect(gapi.isValidCode('NT')).toBe(false)
})