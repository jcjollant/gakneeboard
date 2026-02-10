import dotenv from 'dotenv';
// Access prod DB
dotenv.config();
process.env.POSTGRES_URL = process.env.POSTGRES_PROD_URL;

import { UserDao } from '../backend/dao/UserDao';
import { Business } from '../backend/business/Business';
import { PLANS } from '@checklist/shared';

async function upgrade() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error('Usage: npx ts-node server/cli/upgradeProdUserPlan.ts <userId> <planId>');
        process.exit(1);
    }

    const userId = parseInt(args[0]);
    const planId = args[1];

    if (isNaN(userId)) {
        console.error('Invalid userId');
        process.exit(1);
    }

    const plan = PLANS.find(p => p.id === planId);
    if (!plan) {
        console.error(`Invalid planId: ${planId}. Available plans: ${PLANS.map(p => p.id).join(', ')}`);
        process.exit(1);
    }

    console.log(`Upgrading user ${userId} to plan ${plan.displayName} (${plan.id})...`);

    const userDao = new UserDao();
    try {
        const user = await userDao.get(userId);
        if (!user) {
            console.error(`User ${userId} not found`);
            process.exit(1);
        }

        if (!user.customerId) {
            console.error(`User ${userId} has no customerId. Cannot upgrade via Business.upgradeUser.`);
            process.exit(1);
        }

        await Business.upgradeUser(user.customerId, plan.accountType, plan.id, userDao, 'cli upgrade');
        console.log(`Successfully upgraded user ${userId} to ${plan.id}`);

    } catch (err) {
        console.error('Error upgrading user:', err);
        process.exit(1);
    } finally {
        userDao.end();
    }
}

upgrade();
