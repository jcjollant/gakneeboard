import {describe, expect, test} from '@jest/globals';

import { PublicationDao } from '../backend/PublicationDao'

import { postgresUrl } from './constants.ts';

process.env.POSTGRES_URL=postgresUrl


describe('Publication', () => {

    test('countAvailable', async () => {
        const available:number = await PublicationDao.countAvailable()
        expect(available).toBeGreaterThanOrEqual(3)
        expect(available).toBeLessThan(36*36)
    })
})
