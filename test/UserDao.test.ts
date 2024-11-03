
import { describe, expect, test} from '@jest/globals';
import { UserDao } from '../backend/dao/UserDao.ts'
import { postgresUrl, jcUserId, jcHash, jcEmail, jcName, jcSource, jcMaxTemplates } from './constants.ts';

process.env.POSTGRES_URL=postgresUrl

describe('UserDao', () => {
    test('Count', async () => {
        const userDao = new UserDao();
        expect(await userDao.count()).toBeGreaterThan(15);
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
            expect(user?.maxTemplates).toBe(jcMaxTemplates)
        })
    })
});

