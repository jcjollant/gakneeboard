// import { adipJfk } from './testData.js'
// import { fetch, fromAdip } from '../api/adip.js'
const adip = require('../backend/adip')
const fs = require('fs')

test('TPA should be 1000 above elevation',() =>{
    expect(adip.getTpa(0)).toBe(1000)
    expect(adip.getTpa(440)).toBe(1440)
    expect(adip.getTpa(450)).toBe(1450)
    expect(adip.getTpa(500)).toBe(1500)
    expect(adip.getTpa(1100)).toBe(2100)
})

test('Variation should be <0 for East and >0 for west',() =>{
    let data = {'magneticVariation':'15E'}
    expect(adip.getVariation(data)).toBe(-15)
    data = {'magneticVariation':'16W'}
    expect(adip.getVariation(data)).toBe(16)
    // no data => defaults to 0
    data = {}
    expect(adip.getVariation(data)).toBe(0)
})

test('Frequency',() => {
    expect(adip.getFrequency('117.1 ;ARR-NE')).toBe('117.1')    
    expect(adip.getFrequency('123.0')).toBe('123.0')    
    expect(adip.getFrequency('120.2 ;RWY 16L/34R')).toBe('120.2')    
})

test('Names are capitalized', () => {
    expect(adip.getName('THIS IS A NAME')).toBe('This Is A Name')    
})

test('Fetch Renton and check fields',async () =>{
    const before = Date.now()
    const airport = await adip.fetchAirport('RNT')
    console.log(JSON.stringify(airport))
    expect(airport.code).toBe('KRNT')
    expect(airport.locId).toBe('RNT')
    expect(airport.icaoId).toBe('KRNT')
    expect(airport.name).toBe('Renton Muni')
    expect(airport.ctaf).toBe('124.700')
    expect(airport.gnd).toBe('121.6')
    expect(airport.twr).toBe('Y')
    expect(airport.elev).toBe(32)
    expect(airport.tpa).toBe(1032)
    expect(airport.weather.type).toBe('ATIS')
    expect(airport.weather.freq).toBe('126.95')
    runway = airport.rwy[0]
    expect(runway.name).toBe('16-34')
    expect(runway.length).toBe(5382)
    expect(runway.width).toBe(200)
    expect(runway.surface.type).toBe('ASPH-CONC')
    expect(runway.surface.condition).toBe('G')
    runway16 = runway['16']
    expect(runway16.orientation).toBe(157)
    expect(runway16.pattern).toBe('left')
    runway34 = runway['34']
    expect(runway34.orientation).toBe(337)
    expect(runway34.pattern).toBe('right')

    // effectiveDate should be defined
    expect(airport.effectiveDate).toBe('2024-04-18T00:00:00')
    // ICAO should be defined
    // Fecth time should be higer
    expect(airport.fetchTime).toBeGreaterThan(before)
    expect(airport.version).toBe(4)
})

