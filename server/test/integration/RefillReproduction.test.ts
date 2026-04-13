

import { describe, expect, it, beforeAll, afterAll, xdescribe } from '@jest/globals';
import { UserDao } from '../../backend/dao/UserDao';
import { Business } from '../../backend/business/Business';
import { newTestUser } from '../common';
import { AccountType, PLAN_ID_SIM } from '@gak/shared';
import { sql } from '@vercel/postgres';

require('dotenv').config();
// Force test DB
process.env.POSTGRES_URL = process.env.POSTGRES_TEST_URL

describe('Refill Reproduction', () => {
    let userDao: UserDao;
    const uniqueId = Math.floor(Math.random() * 100000);
    const studentUser = newTestUser(0, AccountType.student, 'sp1');
    const simmerUser = newTestUser(0, AccountType.simmer, PLAN_ID_SIM);

    // Customize shas to avoid collisions if run multiple times or parallel
    studentUser.sha256 = `student-${uniqueId}`;
    simmerUser.sha256 = `simmer-${uniqueId}`;

    beforeAll(async () => {
        userDao = new UserDao();

        // Ensure users don't exist and create them in parallel where possible
        await sql`DELETE FROM users WHERE sha256 IN (${studentUser.sha256}, ${simmerUser.sha256})`;

        await Promise.all([
            userDao.save(studentUser),
            userDao.save(simmerUser)
        ]);
    });

    afterAll(async () => {
        // Cleanup usage records first (created by refill)
        await sql`DELETE FROM usage WHERE user_id IN (SELECT id FROM users WHERE sha256 IN (${studentUser.sha256}, ${simmerUser.sha256}))`;
        // Cleanup users
        await sql`DELETE FROM users WHERE sha256 IN (${studentUser.sha256}, ${simmerUser.sha256})`;
        userDao.end();
    });

    it('should NOT refill student pilots but SHOULD refill simmer users', async () => {
        studentUser.printCredits = 2;
        simmerUser.printCredits = 2;

        await Promise.all([
            userDao.updatePrintCredit(studentUser),
            userDao.updatePrintCredit(simmerUser)
        ]);

        // Force run the refill job (simulating 1st of month)
        const [refills, performed] = await Business.freePrintRefills(userDao, true);

        expect(performed).toBe(true);

        // Refresh users from DB
        const refreshedStudent = await userDao.getFromHash(studentUser.sha256);
        const refreshedSimmer = await userDao.getFromHash(simmerUser.sha256);

        expect(refreshedStudent).toBeDefined();
        expect(refreshedSimmer).toBeDefined();

        // Student should NOT be refilled (should stay at 2)
        // Note: usage of 'sp' vs 'student' enum is consistent in these tests
        console.log(`Student credits: ${refreshedStudent?.printCredits}`);
        expect(refreshedStudent?.printCredits).toBe(2);

        // Simmer SHOULD be refilled (should go to 4, assuming PRINT_CREDIT_SIMMER is 4)
        console.log(`Simmer credits: ${refreshedSimmer?.printCredits}`);
        expect(refreshedSimmer?.printCredits).toBe(4);

        // Check return of printRefills
        // It returns a list of refills. Should contain simmer user id but not student user id.
        const simmerRefill = refills.find(r => r.userId === simmerUser.id);
        const studentRefill = refills.find(r => r.userId === studentUser.id);

        expect(simmerRefill).toBeDefined();
        expect(studentRefill).toBeUndefined();
    });
});
