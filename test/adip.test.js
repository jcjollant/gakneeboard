// import { adipJfk } from './testData.js'
// import { fetch, fromAdip } from '../api/adip.js'
const adip = require('../api/adip')

// const adip = fromAdip(adipJfk)
// const adip = await fetch('dfw')
// console.log(JSON.stringify(adip))
test('TPA should be 1000 above and rounded to 100',() =>{
    expect(adip.getTpa(0)).toBe(1000)
    expect(adip.getTpa(440)).toBe(1400)
    expect(adip.getTpa(450)).toBe(1500)
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

test('Name', () => {
    expect(adip.getName('THIS IS A NAME')).toBe('This Is A Name')    
})