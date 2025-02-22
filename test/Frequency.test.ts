import {describe, expect, test} from '@jest/globals';
import { Frequency, FrequencyType } from '../src/model/Frequency';

describe('Frequency', () => {
    test( 'typeFromString', () => {
        const expectedWeather = ['AWOS', 'AWOS-3', 'AWOS-3PT', 'atis', 'ATIS', 'asos', 'ASOS-3']
        for( const weather of expectedWeather) {
            expect(Frequency.typeFromString(weather)).toBe(FrequencyType.weather)
        }
        const expectedTower = ['tower', 'TOWER', 'twr', 'TWR']
        for( const tower of expectedTower) {
            expect(Frequency.typeFromString(tower)).toBe(FrequencyType.tower)
        }
    })
})