
import { describe, expect, test} from '@jest/globals';
import { Sheet } from '../backend/models/Sheet.ts'
import { UserDao } from '../backend/UserDao.ts'
import { postgresUrl, jcUserId, asUserId, jcTestSheetName, jcDemoSheet } from './constants.ts';

process.env.POSTGRES_URL=postgresUrl

describe('UserDao', () => {
    test('Count', async () => {
        expect(await UserDao.count()).toBeGreaterThan(15)
    })

});

