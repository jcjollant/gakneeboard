import { describe, expect, test} from '@jest/globals';
import { Sunlight } from '../backend/models/Sunlight';

const fromSunrise = '5:58:00 AM'
const toSunrise = '6:03:40 AM'
const fromSunset = '8:32:50 PM'
const toSunset = '8:27:55 PM'
const fromSolarNoon = '1:15:25 PM'
const fromGoldenHour = '7:53:58 PM'
const toGoldenHour = '7:49:36 PM'
const fromDawn = "5:27:03 AM"
const toDawn = "5:33:19 AM"
const fromDusk = "9:03:46 PM"
const toDusk = "8:58:16 PM"

const dataFrom = {"results":{"date":"2024-07-17","sunrise":fromSunrise,"sunset":fromSunset,"first_light":"4:05:30 AM","last_light":"10:25:20 PM","dawn":fromDawn,"dusk":fromDusk,"solar_noon":fromSolarNoon,"golden_hour":"7:53:58 PM","day_length":"14:34:50","timezone":"America/New_York","utc_offset":-240},"status":"OK"}
const dataTo = {"results":{"date":"2024-07-24","sunrise":toSunrise,"sunset":toSunset,"first_light":"4:14:20 AM","last_light":"10:17:15 PM","dawn":toDawn,"dusk":toDusk,"solar_noon":"1:15:47 PM","golden_hour":"7:49:36 PM","day_length":"14:24:14","timezone":"America/New_York","utc_offset":-240},"status":"OK"}

describe( 'Sunrise Tests', () => {

    test('One code', async () => {
        const sunlight = new Sunlight(dataFrom)
        expect(sunlight.dateFrom).toBe('2024-07-17')
        expect(sunlight.dateTo).toBe('2024-07-17')
        expect(sunlight.sunrise).toBe(fromSunrise)
        expect(sunlight.sunset).toBe(fromSunset)
        expect(sunlight.civilTwilight.am).toBe(fromDawn)
        expect(sunlight.civilTwilight.pm).toBe(fromDusk)
        expect(sunlight.solarNoon).toBe(fromSolarNoon)
        expect(sunlight.goldenHour).toBe(fromGoldenHour)
    })

    test('Two results same date', () => {
        const sunlight = new Sunlight(dataFrom, dataTo)
        expect(sunlight.dateFrom).toBe('2024-07-17')
        expect(sunlight.dateTo).toBe('2024-07-24')
        expect(sunlight.sunrise).toBe(fromSunrise)
        expect(sunlight.sunset).toBe(toSunset)
        expect(sunlight.civilTwilight.am).toBe(fromDawn)
        expect(sunlight.civilTwilight.pm).toBe(toDusk)
        expect(sunlight.solarNoon).toBe(fromSolarNoon)
        expect(sunlight.goldenHour).toBe(toGoldenHour)
    })

    test('Two results overnight', () => {
        const sunlight = new Sunlight(dataFrom, dataTo, true)
        expect(sunlight.dateFrom).toBe('2024-07-17')
        expect(sunlight.dateTo).toBe('2024-07-24')
        expect(sunlight.sunrise).toBe(toSunrise)
        expect(sunlight.sunset).toBe(fromSunset)
        expect(sunlight.civilTwilight.am).toBe(toDawn)
        expect(sunlight.civilTwilight.pm).toBe(fromDusk)
        expect(sunlight.solarNoon).toBe(fromSolarNoon)
        expect(sunlight.goldenHour).toBe(toGoldenHour)
    })

})