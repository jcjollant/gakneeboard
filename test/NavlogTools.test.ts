import {describe, expect, test} from '@jest/globals';

import { NavlogTools } from '../backend/NavlogTools'

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
})