
import { describe, expect, test} from '@jest/globals';
import { UserDao } from '../backend/dao/UserDao.ts'
import { postgresUrl, jcUserId, jcHash, jcEmail, jcName, jcSource, jcMaxTemplates } from './constants.ts';
import { AccountType } from '../backend/models/AccountType.ts';
import { User } from '../backend/models/User.ts';

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

    test('parseRow', () => {
        const name = 'Paul'
        const source = 'SomeSource'
        const email = 'paul@example.com'
        const maxTemplates = 12
        const customerId = 'someCustomerId'
        const data:string = JSON.stringify( {name:name,source:source,email:email,maxTemplates:maxTemplates})
        const row = {id:1, sha256:'sha', data:data, accountType:AccountType.beta, customerId: customerId}
        const user:User = UserDao.parseRow(row)
        expect(user.id).toBe(1)
        expect(user.sha256).toBe('sha')
        expect(user.name).toBe(name)
        expect(user.source).toBe(source)
        expect(user.email).toBe(email)
        expect(user.maxTemplates).toBe(maxTemplates)
        expect(user.accountType).toBe(AccountType.beta)
        expect(user.customerId).toBe(customerId)
    })

});

