
import { AccountType } from '@checklist/shared';
import { afterAll, beforeAll, describe, expect, it, xdescribe } from '@jest/globals';
import { db, sql } from '@vercel/postgres';
import { UserDao } from '../../backend/dao/UserDao';
import { User } from '../../backend/models/User';
import { newTestUser } from '../common';
import { jcCustomerId, jcEmail, jcHash, jcName, jcSource, jcUserId, MAX_PAGES_BETA, MAX_PAGES_SIMMER, MAX_TEMPLATE_BETA, MAX_TEMPLATE_SIMMER } from '../constants';

require('dotenv').config();
// Force test DB
process.env.POSTGRES_URL = process.env.POSTGRES_TEST_URL

describe('UserDao', () => {
    let userDao: UserDao;

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
        // Enforce the state of the database to match our expectations
        await sql`UPDATE users SET customer_id=${jcCustomerId} WHERE sha256=${jcHash}`
        await UserDao.getUserFromHash(jcHash).then(user => {
            expect(user?.id).toEqual(jcUserId)
            expect(user?.sha256).toEqual(jcHash)
            expect(user?.name).toEqual(jcName)
            expect(user?.source).toEqual(jcSource)
            expect(user?.email).toEqual(jcEmail)
            expect(user?.customerId).toEqual(jcCustomerId)
        })
    })

    it('parseRow', () => {
        const name = 'Paul'
        const source = 'SomeSource'
        const email = 'paul@example.com'
        const maxPages = 8;
        const maxTemplatesData = 12
        const maxTemplates = 10
        const customerId = 'someCustomerId'
        const createDate = '2025-03-10 06:19:07.69087'
        const data: string = JSON.stringify({ name: name, source: source, email: email, maxTemplates: maxTemplatesData })
        const printCredits = 100
        const row = {
            id: 1,
            sha256: 'sha',
            data: data,
            account_type: AccountType.beta,
            customer_id: customerId,
            print_credit: printCredits,
            max_pages: maxPages,
            max_templates: maxTemplates,
            create_time: createDate
        }
        const userDao = new UserDao();
        const user: User = userDao.parseRow(row)
        expect(user.id).toBe(1)
        expect(user.sha256).toBe('sha')
        expect(user.name).toBe(name)
        expect(user.source).toBe(source)
        expect(user.email).toBe(email)
        expect(user.maxPages).toBe(maxPages)
        expect(user.maxTemplates).toBe(maxTemplates)
        expect(user.accountType).toBe(AccountType.beta)
        expect(user.customerId).toBe(customerId)
        expect(user.printCredits).toBe(printCredits)
        expect(user.createDate).toBe(createDate)
    })

    it('Add Prints', async () => {
        // const userDao = new UserDao();
        const addedCredits = 10;
        await userDao.get(jcUserId).then(async (jc) => {
            const initialPrintCredits = jc.printCredits;
            expect(jc.id).toBe(jcUserId)
            await userDao.addPrints(jc, addedCredits).then(async (jc) => {
                expect(jc.printCredits).toBe(initialPrintCredits + addedCredits)
            })
        })
    })

    it('Save', async () => {
        const existingUser: User = new User(jcUserId, jcHash)
        // Saving an existing user without overwrite should fail
        // const userDao = new UserDao()
        await expect(userDao.save(existingUser)).rejects.toEqual(new Error('Cannot save existing user without overwrite'))

        const newUser = newTestUser()
        let createdUserId = 0;
        try {
            const savedUser = await userDao.save(newUser);
            expect(savedUser.id).toBeGreaterThan(0)
            expect(savedUser.email).toBe(newUser.email)
            expect(savedUser.sha256).toBe(newUser.sha256)
            createdUserId = savedUser.id;

            // overwritte this user
            const userId = savedUser.id
            const newName = 'NewName'
            savedUser.setName(newName);
            const updatedUser = await userDao.save(savedUser, true);
            expect(updatedUser.id).toBe(userId)
            expect(updatedUser.name).toBe(newName)
        } finally {
            if (createdUserId > 0) {
                await sql`DELETE FROM users WHERE id=${createdUserId}`
            }
        }
    })

    it('refills', async () => {
        // limit is 8 chars
        const uniqueId = Math.floor(Math.random() * 99);
        const testType1 = `t1-${uniqueId}`;
        const testType2 = `t2-${uniqueId}`;

        // clean up (just in case)
        await sql`delete from users where account_type = ${testType1} OR account_type=${testType2}`

        // create two groups of users
        // fill an array with 4 'test1' and 6 'test2'
        const previous1 = 3;
        const previous2 = 5;
        for (let index = 0; index < 10; index++) {
            const user = newTestUser()
            // console.log( 'user', user.sha256)
            const accountType = index < 4 ? testType1 : testType2
            const previous = index < 4 ? previous1 : previous2;
            // console.log('['+accountType+']')
            await db.query(`insert into users (sha256,account_type,version, print_credit) values ('${user.sha256}','${accountType}',0, ${previous})`)
        }

        const count1 = 10
        const refill1 = await userDao.refillAccountType(testType1, count1)
        const count2 = 20
        const refill2 = await userDao.refillAccountType(testType2, count2)

        for (let r of refill1) {
            expect(r.previousCount).toBe(previous1)
            expect(r.newCount).toBe(count1)
        }
        for (let r of refill2) {
            expect(r.previousCount).toBe(previous2)
            expect(r.newCount).toBe(count2)
        }

        await sql`delete from users where account_type = ${testType1} OR account_type=${testType2}`
    })

    it('getAll', async () => {
        userDao.getAll().then((users) => {
            expect(users.length).toBeGreaterThan(1)
            // some non zero Id
            expect(users[0].id).toBeGreaterThan(0)
            // We should have some date
            expect(users[0].createDate).toBeDefined()
        })
    })

    it('updateType', async () => {
        const existingUser: User = new User(jcUserId, jcHash)
        existingUser.accountType = AccountType.simmer
        existingUser.maxTemplates = MAX_TEMPLATE_SIMMER
        existingUser.maxPages = MAX_PAGES_SIMMER
        await userDao.updateType(existingUser)
        const readUser = await userDao.get(jcUserId)
        expect(readUser.id).toBe(jcUserId)
        expect(readUser.maxTemplates).toBe(MAX_TEMPLATE_SIMMER)
        expect(readUser.maxPages).toBe(MAX_PAGES_SIMMER)

        // Switch this user to Beta and check wether values are saved
        existingUser.accountType = AccountType.beta
        existingUser.maxTemplates = MAX_TEMPLATE_BETA
        existingUser.maxPages = MAX_PAGES_BETA
        await userDao.updateType(existingUser)
        const readUser2 = await userDao.get(jcUserId)
        expect(readUser2.maxTemplates).toBe(MAX_TEMPLATE_BETA)
        expect(readUser2.maxPages).toBe(MAX_PAGES_BETA)
    })
});

