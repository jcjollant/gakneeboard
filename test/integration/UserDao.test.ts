
import { afterAll, beforeAll, describe, expect, it} from '@jest/globals';
import { UserDao } from '../../backend/dao/UserDao'
import { jcUserId, jcHash, jcEmail, jcName, jcSource, jcMaxTemplates } from '../constants';
import { AccountType } from '../../backend/models/AccountType';
import { User } from '../../backend/models/User';
import { newTestUser } from '../common'
import { db, sql } from '@vercel/postgres';
import { after } from 'node:test';

require('dotenv').config();

describe('UserDao', () => {
    let userDao:UserDao;
    
    beforeAll(async () => {
        userDao = new UserDao();
    })

    afterAll(async () => {
        userDao.end()
    })

    it('Count', async () => {
        expect(await userDao.count()).toBeGreaterThan(1);
    })

    it('getIdFromHash', async () => {
        await UserDao.getIdFromHash(jcHash).then(id => {
            expect(id).toEqual(jcUserId)
        })
    })

    it('getUserFromHash', async () => {
        await UserDao.getUserFromHash(jcHash).then(user => {
            expect(user?.id).toEqual(jcUserId)
            expect(user?.sha256).toEqual(jcHash)
            expect(user?.name).toEqual(jcName)
            expect(user?.source).toEqual(jcSource)
            expect(user?.email).toEqual(jcEmail)
        })
    })

    it('parseRow', () => {
        const name = 'Paul'
        const source = 'SomeSource'
        const email = 'paul@example.com'
        const maxTemplates = 12
        const customerId = 'someCustomerId'
        const createDate = '2025-03-10 06:19:07.69087'
        const data:string = JSON.stringify( {name:name,source:source,email:email,maxTemplates:maxTemplates})
        const printCredits = 100
        const row = {id:1, sha256:'sha', data:data, account_type:AccountType.beta, customer_id: customerId, print_credit: printCredits, create_time:createDate}
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
        expect(user.createDate).toBe(createDate)
    })

    it('Add Prints', async () => {
        // const userDao = new UserDao();
        const addedCredits = 10;
        await userDao.get(jcUserId).then( async (jc) => {
            const initialPrintCredits = jc.printCredits;
            expect(jc.id).toBe(jcUserId)
            await userDao.addPrints(jc, addedCredits).then( async (jc) => {
                expect(jc.printCredits).toBe(initialPrintCredits+addedCredits)
            })
        })
    })

    it('Save', async () => {
        const existingUser:User = new User(jcUserId, jcHash)
        // Saving an existing user without overwrite should fail
        // const userDao = new UserDao()
        await expect(userDao.save(existingUser)).rejects.toEqual('Cannot save existing user without overwrite')

        const newUser = newTestUser()
        await userDao.save(newUser).then( (user:User) => {
            expect(user.id).toBeGreaterThan(0)
            expect(user.email).toBe(newUser.email)
            expect(user.sha256).toBe(newUser.sha256)

            // overwritte this user
            const userId = user.id
            const newName = 'NewName'
            user.setName(newName);
            userDao.save(user, true).then( (user:User) => {
                expect(user.id).toBe(userId)
                expect(user.name).toBe(newName)
            })
        })
    })

    it('refills', async () => {
        // clean up
        await sql`delete from users where account_type = 'test1' OR account_type='test2'`

        // create two groups of users
        // fill an array with 4 'test1' and 6 'test2'
        const previous1 = 3;
        const previous2 = 5;
        for( let index = 0; index < 10; index++) {
            const user = newTestUser()
            const accountType = index < 4 ? 'test1' : 'test2'
            const previous = index < 4 ? previous1 : previous2;
            // console.log('['+accountType+']')
            await db.query(`insert into users (sha256,account_type,version, print_credit) values ('${user.sha256}','${accountType}',0, ${previous})`)
        }

        const count1 = 10
        const refill1 = await userDao.refill(count1, 'test1')
        const count2 = 20
        const refill2 = await userDao.refill(count2, 'test2')

        for(let r of refill1) {
            expect(r.previousCount).toBe(previous1)
            expect(r.newCount).toBe(count1)
        }
        for(let r of refill2) {
            expect(r.previousCount).toBe(previous2)
            expect(r.newCount).toBe(count2)
        }

        await sql`delete from users where account_type = 'test1' OR account_type='test2'`
    })

    it('getAll', async () => {
        userDao.getAll().then( (users) => {
            expect(users.length).toBeGreaterThan(1)
            // some non zero Id
            expect(users[0].id).toBeGreaterThan(0)
            // We should have some date
            expect(users[0].createDate).toBeDefined()
        })
    })
});

