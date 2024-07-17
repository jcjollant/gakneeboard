import { describe, expect, test} from '@jest/globals';
import { Sunlight } from '../backend/models/Sunlight';

const testData = {"results":{"date":"2024-07-17","sunrise":"5:58:00 AM","sunset":"8:32:50 PM","first_light":"4:05:30 AM","last_light":"10:25:20 PM","dawn":"5:27:03 AM","dusk":"9:03:46 PM","solar_noon":"1:15:25 PM","golden_hour":"7:53:58 PM","day_length":"14:34:50","timezone":"America/New_York","utc_offset":-240},"status":"OK"}
describe( 'Sunrise Tests', () => {

    test('One code', async () => {
        const sunlight = new Sunlight(testData)
        expect(sunlight.date).toBe('2024-07-17')
        expect(sunlight.sunrise).toBe('5:58:00 AM')
        expect(sunlight.sunset).toBe('8:32:50 PM')
        expect(sunlight.civilTwilight.am).toBe('5:27:03 AM')
        expect(sunlight.civilTwilight.pm).toBe('9:03:46 PM')
        expect(sunlight.solarNoon).toBe('1:15:25 PM')
        expect(sunlight.goldenHour).toBe('7:53:58 PM')
        })
})