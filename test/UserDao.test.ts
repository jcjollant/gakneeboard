
import { describe, expect, test} from '@jest/globals';
import { UserDao } from '../backend/UserDao.ts'
import { postgresUrl, jcUserId, jcHash, jcEmail, jcName, jcSource } from './constants.ts';
import { User } from '../backend/models/User.ts';

process.env.POSTGRES_URL=postgresUrl

describe('UserDao', () => {
    test('Count', async () => {
        expect(await UserDao.count()).toBeGreaterThan(15)
    })

    test('getIdFromHash', async () => {
        UserDao.getIdFromHash(jcHash).then(id => {
            expect(id).toEqual(jcUserId)
        })
    })

    test('getUserFromHash', async () => {
        UserDao.getUserFromHash(jcHash).then(user => {
            expect(user?.id).toEqual(jcUserId)
            expect(user?.sha256).toEqual(jcHash)
            expect(user?.name).toEqual(jcName)
            expect(user?.source).toEqual(jcSource)
            expect(user?.email).toEqual(jcEmail)
            expect(user?.maxTemplates).toBe(User.defaultMaxTemplates)
        })
    })
});

