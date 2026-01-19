import { describe, expect, it, test, jest } from '@jest/globals';

import { PublicationDao } from '../backend/PublicationDao'

jest.mock('../backend/PublicationDao');

require('dotenv').config();


describe('Publication', () => {

    it('countAvailable', async () => {
        (PublicationDao.countAvailable as unknown as jest.Mock<any>).mockResolvedValue(10);
        const available: number = await PublicationDao.countAvailable()
        expect(available).toBeGreaterThanOrEqual(0)
    })
})
