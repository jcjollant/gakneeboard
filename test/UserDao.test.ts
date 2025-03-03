
import { describe, expect, test} from '@jest/globals';
import { UserDao } from '../backend/dao/UserDao.ts'
import { jcUserId, jcHash, jcEmail, jcName, jcSource, jcMaxTemplates } from './constants.ts';
import { AccountType } from '../backend/models/AccountType.ts';
import { User } from '../backend/models/User.ts';

require('dotenv').config();

describe('UserDao', () => {
    test('Count', async () => {
        const userDao = new UserDao();
        expect(await userDao.count()).toBeGreaterThan(1);
    })

    test('getIdFromHash', async () => {
        await UserDao.getIdFromHash(jcHash).then(id => {
            expect(id).toEqual(jcUserId)
        })
    })

    test('getUserFromHash', async () => {
        await UserDao.getUserFromHash(jcHash).then(user => {
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
        const printCredits = 100
        const row = {id:1, sha256:'sha', data:data, account_type:AccountType.beta, customer_id: customerId, print_credit: printCredits}
        const userDao = new UserDao();
        const user:User = userDao.parseRow(row)
        expect(user.id).toBe(1)
        expect(user.sha256).toBe('sha')
        expect(user.name).toBe(name)
        expect(user.source).toBe(source)
        expect(user.email).toBe(email)
        expect(user.maxTemplates).toBe(maxTemplates)
        expect(user.accountType).toBe(AccountType.beta)
        expect(user.customerId).toBe(customerId)
        expect(user.printCredits).toBe(printCredits)
    })

    test('Add Prints', async () => {
        const userDao = new UserDao();
        const addedCredits = 10;
        await userDao.get(jcUserId).then( async (jc) => {
            const initialPrintCredits = jc.printCredits;
            expect(jc.id).toBe(jcUserId)
            await userDao.addPrints(jc, addedCredits).then( async (jc) => {
                expect(jc.printCredits).toBe(initialPrintCredits+addedCredits)
            })
        })
    })
});

