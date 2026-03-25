import {describe, expect, test} from '@jest/globals';
import { Frequency, FrequencyType } from '../src/models/Frequency';

describe('Frequency', () => {
    describe('typeFromString', () => {
        const cases: [string, FrequencyType][] = [
            // Weather
            ['AWOS', FrequencyType.weather],
            ['AWOS-1', FrequencyType.weather],
            ['AWOS-2', FrequencyType.weather],
            ['AWOS-3', FrequencyType.weather],
            ['AWOS-4', FrequencyType.weather],
            ['AWOS-3P', FrequencyType.weather],
            ['AWOS-3PT', FrequencyType.weather],
            ['AWOS-3T', FrequencyType.weather],
            ['atis', FrequencyType.weather],
            ['ATIS', FrequencyType.weather],
            ['asos', FrequencyType.weather],
            ['ASOS-3', FrequencyType.weather],
            ['D-ATIS', FrequencyType.weather],
            // Tower
            ['tower', FrequencyType.tower],
            ['TOWER', FrequencyType.tower],
            ['twr', FrequencyType.tower],
            ['TWR', FrequencyType.tower],
            // Ground
            ['GND', FrequencyType.ground],
            ['unicom', FrequencyType.ground],
            ['Ground', FrequencyType.ground],
            // TRACON
            ['tracon', FrequencyType.tracon],
            ['TRACON', FrequencyType.tracon],
            ['SEATTLE-TACOMA APPROACH CONTROL', FrequencyType.tracon],
            ['PORTLAND DEPARTURE', FrequencyType.tracon],
            ['SOCAL APP', FrequencyType.tracon],
            ['DEP/P', FrequencyType.tracon],
            ['Seattle TRACON', FrequencyType.tracon],
            // Unknown
            ['something else', FrequencyType.unknown],
        ];

        test.each(cases)('identifies "%s" as %s', (input, expected) => {
            expect(Frequency.typeFromString(input)).toBe(expected);
        });
    });
});