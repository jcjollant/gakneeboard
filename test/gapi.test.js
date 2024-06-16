import { GApi } from '../backend/gapi'
import { hashJc, postgresUrl } from './constants'

process.env.POSTGRES_URL=postgresUrl


test('Renton is found with both codes', async () => {
    let airport = await GApi.getAirport('RNT')
    expect(airport.code).toBe('KRNT')
    let airport2 = await GApi.getAirport('KRNT')
    expect(airport2.code).toBe('KRNT')
})

test('Getting multiple Airports', async () => {
    let list = ['rnt','jfk']
    let airports = await GApi.getAirportsList(list)
    // console.log(airports)
    expect(airports.length).toBe(list.length)
    expect(airports[0].code).toBe('KRNT')
    expect(airports[1].code).toBe('KJFK')

    let list2 = ['jc','pae','jcj']
    airports = await GApi.getAirportsList(list2)
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
    let airports = await GApi.getAirportsList(list)
    // console.log(airports)
    expect(airports.length).toBe(2)
    expect(airports[0].code).toBe('NT')
    expect(airports[0].version).toBe(-1)
    expect(airports[1].code).toBe('FK')
    expect(airports[1].version).toBe(-1)

    expect
})

test('ICAOs are valid', () => {
    expect(GApi.getIcao('KRNTA')).toBeNull()
    expect(GApi.getIcao('KRNT')).toBe('KRNT')
    expect(GApi.getIcao('RNT')).toBe('KRNT')
    expect(GApi.getIcao('NT')).toBeNull()
})

test('locId are valid', () => {
    expect(GApi.getLocId('KRNTA')).toBeNull()
    expect(GApi.getLocId('KRNT')).toBe('RNT')
    expect(GApi.getLocId('krnt')).toBe('RNT')
    expect(GApi.getLocId('S43')).toBe('S43')
    expect(GApi.getLocId('NT')).toBeNull()
})

test('Militrary frequencies', () => {
    expect(GApi.isMilitary(null)).toBe(false)
    expect(GApi.isMilitary('-.-')).toBe(false)
    expect(GApi.isMilitary('')).toBe(false)
    expect(GApi.isMilitary('121.6')).toBe(false)
    expect(GApi.isMilitary('261.6')).toBe(true)
})

test('Update airport', async () => {
    const customRnt = {"code":"TEST","name":"Test Airport JC","elev":1000,"freq":[{"name":"CTAF","mhz":124.7},{"name":"TWR","mhz":null},{"name":"Weather","mhz":126.95},{"name":"GND","mhz":121.6}],"rwys":[{"name":"16-34","length":5400,"width":120,"ends":[null]}],"custom":false,"version":6,"effectiveDate":""}
    expect(await GApi.createCustomAirport(hashJc,customRnt)).toBe('TEST')
})