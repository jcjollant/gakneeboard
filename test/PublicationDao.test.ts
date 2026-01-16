import {describe, expect, it, test} from '@jest/globals';

import { PublicationDao } from '../backend/PublicationDao'

require('dotenv').config();


describe('Publication', () => {

    it('countAvailable', async () => {
        const available:number = await PublicationDao.countAvailable()
        expect(available).toBeGreaterThanOrEqual(0)
        expect(available).toBeLessThan(36*36)
    })
})
