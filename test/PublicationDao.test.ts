import {describe, expect, test} from '@jest/globals';

import { PublicationDao } from '../backend/PublicationDao'

require('dotenv').config();


describe('Publication', () => {

    test('countAvailable', async () => {
        const available:number = await PublicationDao.countAvailable()
        expect(available).toBeGreaterThanOrEqual(3)
        expect(available).toBeLessThan(36*36)
    })
})
