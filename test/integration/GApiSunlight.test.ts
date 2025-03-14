import { describe, expect, it} from '@jest/globals';
import { GApi } from '../../backend/GApi';

require('dotenv').config();

describe('Sunglight', () => {
    it('Sunlight API same day', async () => {
        await GApi.getSunlight('KRNT', 'KSFF', 20240717).then( data => {
            expect(data).toBeDefined()
            expect(data?.dateFrom).toBe('2024-07-17')
            expect(data?.dateTo).toBe('2024-07-17')
            expect(data?.sunrise).toBe('5:30:49 AM')
            expect(data?.sunset).toBe('8:42:38 PM') // KSFF
            expect(data?.civilTwilight.am).toBe('4:52:34 AM')
            expect(data?.civilTwilight.pm).toBe('9:21:07 PM')
            expect(data?.solarNoon).toBe('1:16:08 PM')
            expect(data?.goldenHour).toBe('7:56:07 PM')
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })

    it('Sunlight Overnight', async () => {
        await GApi.getSunlight('KRNT', 'KSFF', 20240717, 20240718).then( data => {
            expect(data).toBeDefined()
            expect(data?.dateFrom).toBe('2024-07-17')
            expect(data?.dateTo).toBe('2024-07-18')
            expect(data?.sunrise).toBe('5:11:34 AM') // KSFF
            expect(data?.sunset).toBe('9:01:28 PM') // KRNT
            expect(data?.civilTwilight.am).toBe('4:33:15 AM') // KSFF 07-18
            expect(data?.civilTwilight.pm).toBe('9:39:43 PM') // KRNT 07-17
            expect(data?.solarNoon).toBe('1:16:08 PM') // KRNT
            expect(data?.goldenHour).toBe('7:55:19 PM') // KSFF

            // KRNT {"results":{"date":"2024-07-17","sunrise":"5:29:46 AM","sunset":"9:02:20 PM","first_light":"2:51:17 AM","last_light":"11:40:50 PM","dawn":"4:51:22 AM","dusk":"9:40:44 PM","solar_noon":"1:16:03 PM","golden_hour":"8:15:55 PM","day_length":"15:32:33","timezone":"America/Los_Angeles","utc_offset":-420},"status":"OK"}
            // KSFF {"results":{"date":"2024-07-18","sunrise":"5:10:30 AM","sunset":"8:42:38 PM","first_light":"2:31:36 AM","last_light":"11:21:32 PM","dawn":"4:32:01 AM","dusk":"9:21:07 PM","solar_noon":"12:56:34 PM","golden_hour":"7:56:07 PM","day_length":"15:32:08","timezone":"America/Los_Angeles","utc_offset":-420},"status":"OK"}            
        }).catch( (e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })
})

