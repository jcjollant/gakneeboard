import {describe, expect, test} from '@jest/globals';
import fs from 'fs'
import { NavlogTools } from '../backend/NavlogTools'
import { postgresUrl } from './constants';

process.env.POSTGRES_URL=postgresUrl

describe('navlog Tools', () => {
    test ('constructor', () => {
        // Renton
        const lat1 = 47.493139
        const lon1 = -122.215750
        // Norman Grier
        const lat2 = 47.337097
        const lon2 = -122.103536
        const expected = 10.42
        expect( NavlogTools.calculateNauticalMiles(lat1, lon1, lat2, lon2)).toBeCloseTo(expected)
    })
    test ('toDegrees', () => {
        expect(NavlogTools.toDegrees(0)).toBeCloseTo(0)
        expect(NavlogTools.toDegrees(Math.PI/4)).toBeCloseTo(45)
        expect(NavlogTools.toDegrees(Math.PI/2)).toBeCloseTo(90)
        expect(NavlogTools.toDegrees(Math.PI)).toBeCloseTo(180)
        expect(NavlogTools.toDegrees(1.5*Math.PI)).toBeCloseTo(270)
        expect(NavlogTools.toDegrees(2.5*Math.PI)).toBeCloseTo(360+90)
    })
    test ('toRadians', () => {
        expect(NavlogTools.toRadians(0)).toBeCloseTo(0)
        expect(NavlogTools.toRadians(45)).toBeCloseTo(Math.PI/4)
        expect(NavlogTools.toRadians(90)).toBeCloseTo(Math.PI/2)
        expect(NavlogTools.toRadians(180)).toBeCloseTo(Math.PI)
        expect(NavlogTools.toRadians(270)).toBeCloseTo(1.5 * Math.PI)
        expect(NavlogTools.toRadians(360+90)).toBeCloseTo(2.5*Math.PI)
    })
    test('Flight Plan Import', () => {
        const buffer = fs.readFileSync('./test/KBVS.fpl')
        NavlogTools.importFlightPlan(buffer).then( list => {
            const expected = [
                {"name":"KRNT","alt":32,"tc":154,"ld":10.42},
                {"name":"S36","tc":0,"ld":34.09},
                {"name":"S43","tc":352,"ld":15.53},
                {"name":"KAWO","tc":331,"ld":21.35},
                {"name":"KBVS","alt":145.1}]

            expect(list.length).toBe(5)
            expect(list).toEqual(expected)
        })
    })
})