import {describe, expect, test} from '@jest/globals';
import { Frequency, FrequencyType } from '../src/model/Frequency';

describe('Frequency', () => {
    test( 'typeFromString', () => {
        const expectedWeather = ['AWOS', 'AWOS-1', 'AWOS-2', 'AWOS-3', 'AWOS-4', 'AWOS-3P', 'AWOS-3PT', 'AWOS-3T', 'atis', 'ATIS', 'asos', 'ASOS-3', 'D-ATIS']
        for( const weather of expectedWeather) {
            expect(Frequency.typeFromString(weather)).toBe(FrequencyType.weather)
        }
        const expectedTower = ['tower', 'TOWER', 'twr', 'TWR']
        for( const tower of expectedTower) {
            expect(Frequency.typeFromString(tower)).toBe(FrequencyType.tower)
        }
        const expectedGround = ['GND', 'unicom', 'Ground']
        for( const ground of expectedGround) {
            expect(Frequency.typeFromString(ground)).toBe(FrequencyType.ground)
        }
    })
})