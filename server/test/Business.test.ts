
import { describe, expect, jest, it } from '@jest/globals'
import { AccountType, PLAN_ID_SIM, PLANS, PRINT_CREDIT_SIMMER } from '@checklist/shared';
import { Business } from '../backend/business/Business';
import { getMockBrandNewSubscription, getMockSubscriptionDao, getMockUserDao, newTestUser } from './common';
import { MAX_TEMPLATE_SIMMER, MAX_PAGES_SIMMER, MAX_TEMPLATE_BETA, MAX_PAGES_BETA, PRINT_CREDIT_BETA, MAX_TEMPLATE_STUDENT, MAX_PAGES_STUDENT, PRINT_CREDIT_STUDENT, MAX_PAGES_PRIVATE, PRINT_CREDIT_PRIVATE } from './constants';
import { Email } from '../backend/Email';
import { User } from '../backend/models/User';
import { UsageDao } from '../backend/dao/UsageDao';
import { PlanService } from '../backend/services/PlanService';

// Mock the dependencies
jest.mock('../backend/dao/UserDao');
jest.mock('../backend/dao/SubscriptionDao');
jest.mock('../backend/Email');

require('dotenv').config();

const expectedPrintCreditSimmer = 4
const expectedPrintCreditStudent = 8
const MAX_TEMPLATE_PRIVATE = 5

describe('Business', () => {

    const mockEmail = jest.spyOn(Email, 'send').mockResolvedValue(true);
    const mockUsage = jest.spyOn(UsageDao, 'refill').mockResolvedValue();

    const testUser = newTestUser();
    const testUserDao = getMockUserDao(testUser);
    const testSubsciption = getMockBrandNewSubscription()
    const testSubsciptionDao = getMockSubscriptionDao(testSubsciption)

    describe('calculatePrintCredits', () => {
        it('should return correct credits for simmer account', () => {
            const newUser = newTestUser(0, AccountType.simmer, PLAN_ID_SIM)
            newUser.printCredits = 0; // no credits
            const c0 = Business['calculatePrintCredits'](newUser);
            expect(c0).toBe(expectedPrintCreditSimmer);
            newUser.printCredits = 2; // existing credits
            const c1 = Business['calculatePrintCredits'](newUser);
            expect(c1).toBe(expectedPrintCreditSimmer);
            newUser.printCredits = 6; // existing credits higher than refill
            const c2 = Business['calculatePrintCredits'](newUser);
            expect(c2).toBe(6); // should not loose credits
            newUser.printCredits = -1; // weird credits
            const c3 = Business['calculatePrintCredits'](newUser);
            expect(c3).toBe(expectedPrintCreditSimmer);
        });

        it('should return correct credits for student account', () => {
            const newUser = newTestUser(0, AccountType.student, 'pp1')
            newUser.printCredits = 0; // no credits
            const c1 = Business['calculatePrintCredits'](newUser);
            expect(c1).toBe(expectedPrintCreditStudent);
        });

        it('should return correct credits for private account', () => {
            const expectedRefill = 16
            const newUser = newTestUser(0, AccountType.private, 'pp2')
            newUser.printCredits = 0; // no credits
            const c1 = Business['calculatePrintCredits'](newUser);
            expect(c1).toBe(expectedRefill);
        });
    });

    describe('quotas', () => {
        const user = new User(0, '')

        it('should return simmer account quotas', () => {
            user.accountType = AccountType.simmer
            user.planId = PLAN_ID_SIM
            const quotas = Business.getQuotas(user);
            expect(quotas.pages).toBe(2);
            expect(quotas.prints).toBe(4);
            expect(quotas.templates).toBe(1);
        });

        it('should return student account quotas', () => {
            user.accountType = AccountType.student
            user.planId = 'pp1'
            const quotas = Business.getQuotas(user);
            expect(quotas.pages).toBe(4);
            expect(quotas.prints).toBe(8);
            expect(quotas.templates).toBe(2);
        });

        it('should return private account quotas', () => {
            user.accountType = AccountType.private
            user.planId = 'pp2'
            const quotas = Business.getQuotas(user);
            expect(quotas.pages).toBe(20);
            expect(quotas.prints).toBe(16);
            expect(quotas.templates).toBe(5);
        });

        it('should return lifetime deal account quotas', () => {
            user.accountType = AccountType.lifetime
            user.planId = 'ld1'
            const quotas = Business.getQuotas(user);
            expect(quotas.pages).toBe(20);
            expect(quotas.prints).toBe(16);
            expect(quotas.templates).toBe(5);
        });

        it('should return beta account quotas', () => {
            user.accountType = AccountType.beta
            user.planId = 'bd1'
            const quotas = Business.getQuotas(user);
            expect(quotas.pages).toBe(50);
            expect(quotas.prints).toBe(-1);
            expect(quotas.templates).toBe(10);
        });
    });

    describe('printConsume', () => {

        const meteredAccounts = [{ type: AccountType.simmer, planId: PLAN_ID_SIM }, { type: AccountType.student, planId: 'pp1' }, { type: AccountType.private, planId: 'pp2' }, { type: AccountType.lifetime, planId: 'ld1' }]

        it('should decrease print credits for all metered account types', async () => {
            for (const account of meteredAccounts) {
                const initialPrintCredit = 3
                const newUser = newTestUser(0, account.type, account.planId)
                const mockUserDao = getMockUserDao(newUser);

                newUser.printCredits = initialPrintCredit;

                const success = await Business.printConsume(newUser, mockUserDao);

                expect(success).toBe(true);
                expect(newUser.printCredits).toBe(initialPrintCredit - 1);
                expect(mockUserDao.updatePrintCredit).toHaveBeenCalledWith(newUser);
            }
        });

        it('should fail metered accounts without credit', async () => {
            for (const account of meteredAccounts) {
                const initialPrintCredit = 0
                const newUser = newTestUser(0, account.type, account.planId);
                const mockUserDao = getMockUserDao(newUser);
                newUser.printCredits = initialPrintCredit;

                const success = await Business.printConsume(newUser, mockUserDao);

                expect(success).toBe(false);
                expect(newUser.printCredits).toBe(initialPrintCredit);
                expect(mockUserDao.updatePrintCredit).not.toHaveBeenCalled();
            }
        });

        // beta accounts
        it('should not decrease credits for beta account', async () => {
            const initialPrintCredit = 3;
            const newUser = newTestUser(0, AccountType.beta, 'bd1');
            const mockUserDao = getMockUserDao(newUser);
            newUser.printCredits = initialPrintCredit;

            const success = await Business.printConsume(newUser, mockUserDao);

            expect(success).toBe(true);
            expect(newUser.printCredits).toBe(initialPrintCredit);
            expect(mockUserDao.updatePrintCredit).not.toHaveBeenCalled();
        });

        it('should succeed beta account without credit', async () => {
            const initialPrintCredit = 0
            const newUser = newTestUser(0, AccountType.beta, 'bd1');
            const mockUserDao = getMockUserDao(newUser);
            newUser.printCredits = initialPrintCredit;

            const success = await Business.printConsume(newUser, mockUserDao);

            expect(success).toBe(true);
            expect(newUser.printCredits).toBe(initialPrintCredit);
            expect(mockUserDao.updatePrintCredit).not.toHaveBeenCalled();
        });
    });



    describe('subscriptionUpdate', () => {
        it('should reject unknown account type', async () => {
            await expect(Business.subscriptionUpdate(
                'sub-id',
                'customer-id',
                'price-id',
                { accountType: AccountType.unknown } as any,
                123456,
                null,
                null,
                testUserDao,
                testSubsciptionDao
            )).rejects.toThrow('Account type is unknown');
        });

        it('should update subscription successfully', async () => {
            const user = newTestUser()
            user.accountType = AccountType.simmer;
            const mockUserDao = getMockUserDao(user);
            mockEmail.mockReset();

            await Business.subscriptionUpdate(
                testSubsciption.id,
                testSubsciption.customerId,
                testSubsciption.priceId,
                PlanService.getPlan('pp2')!,
                123456,
                null,
                null,
                mockUserDao,
                testSubsciptionDao
            );

            expect(testSubsciptionDao.update).toHaveBeenCalledTimes(1);
            expect(mockUserDao.getFromCustomerId).toHaveBeenCalledTimes(1);
            // User account type should be updated
            expect(user.accountType).toBe(AccountType.private);
            expect(Email.send).toHaveBeenCalledTimes(1);

            // Now upgrade to beta
            await Business.subscriptionUpdate(
                testSubsciption.id,
                testSubsciption.customerId,
                testSubsciption.priceId,
                PlanService.getPlan('bd1')!,
                123456,
                null,
                null,
                mockUserDao,
                testSubsciptionDao
            );

            expect(testSubsciptionDao.update).toHaveBeenCalledTimes(2);
            // User account type should be updated
            expect(user.accountType).toBe(AccountType.beta);
            expect(Email.send).toHaveBeenCalledTimes(2);

        });
    });

    describe('subscriptionStop', () => {
        it('should reject invalid subscription id', async () => {
            const user = newTestUser()
            const mockUserDao = getMockUserDao(user)
            const now = new Date().getTime()
            await expect(Business.subscriptionStop('', 'customer-id', mockUserDao, now, now)).rejects.toEqual('Subscription Id is required')
        })

        it('should reject invalid customer id', async () => {
            const user = newTestUser()
            const mockUserDao = getMockUserDao(user)
            const now = new Date().getTime()
            await expect(Business.subscriptionStop('sub-id', '', mockUserDao, now, now)).rejects.toEqual('Customer Id is required')
        })

        it('should stop subscription', async () => {
            const user = newTestUser()
            user.accountType = AccountType.private
            const mockUserDao = getMockUserDao(user)
            const now = new Date().getTime()
            await Business.subscriptionStop('customer-id', 'sub-id', mockUserDao, now, now).then(u => {
                // Account should be downgraded to simmer
                expect(u.accountType).toBe(AccountType.simmer)
            })
        })
    })

    describe('updateAccountType', () => {
        it('should call updateType and send email', async () => {
            const user = newTestUser()
            const mockUserDao = getMockUserDao(user)
            mockEmail.mockReset()

            expect(user.maxTemplates).toEqual(MAX_TEMPLATE_SIMMER)
            expect(user.maxPages).toEqual(MAX_PAGES_SIMMER)
            expect(user.printCredits).toEqual(expectedPrintCreditSimmer)

            await Business.updateAccountType(user, AccountType.beta, 'bd1', mockUserDao)

            expect(user.maxTemplates).toEqual(MAX_TEMPLATE_BETA)
            expect(user.maxPages).toEqual(MAX_PAGES_BETA)
            expect(user.printCredits).toEqual(PRINT_CREDIT_BETA)

            expect(mockUserDao.updateType).toHaveBeenCalledTimes(1);
            expect(Email.send).toHaveBeenCalledTimes(1);
        })

        it('should refill print credit for student pilots', async () => {
            const user = newTestUser(0, AccountType.simmer, PLAN_ID_SIM)
            const mockUserDao = getMockUserDao(user)

            await Business.updateAccountType(user, AccountType.student, 'pp1', mockUserDao)
            expect(user.printCredits).toEqual(expectedPrintCreditStudent)

            // use a few prints
            user.printCredits -= 2
            await Business.updateAccountType(user, AccountType.student, 'pp1', mockUserDao)
            expect(user.printCredits).toEqual(expectedPrintCreditStudent)

            // one month without usage
            await Business.updateAccountType(user, AccountType.student, 'pp1', mockUserDao)
            expect(user.printCredits).toEqual(expectedPrintCreditStudent)

            // then downgrades to sim
            await Business.updateAccountType(user, AccountType.simmer, 'sim', mockUserDao)
            expect(user.printCredits).toEqual(expectedPrintCreditSimmer)
        })

    })

    describe('printRefills', () => {
        it('refill all accounts on the first day of the month', async () => {
            jest.useFakeTimers().setSystemTime(new Date('2023-01-02'));
            expect(new Date().getDate()).toBe(1)

            const mockUserDao = getMockUserDao(newTestUser())

            const [refills, performed] = await Business.freePrintRefills(mockUserDao)

            expect(mockUserDao.refillAccountType).toHaveBeenCalledTimes(1)
            expect(refills).toHaveLength(4)
            expect(performed).toBe(true)
        })

        it('doesn\'t do anything on the second day of the month', async () => {
            jest.useFakeTimers().setSystemTime(new Date('2023-01-03'));
            expect(new Date().getDate()).not.toBe(1)

            const [refills, performed] = await Business.freePrintRefills(testUserDao)
            expect(refills).toHaveLength(0)
            expect(performed).toBe(false)
        })

        it('can be forced on second day of the month', async () => {
            jest.useFakeTimers().setSystemTime(new Date('2023-01-03'));
            expect(new Date().getDate()).not.toBe(1)
            const mockUserDao = getMockUserDao(testUser)

            const [refills, performed] = await Business.freePrintRefills(mockUserDao, true)

            expect(mockUserDao.refillAccountType).toHaveBeenCalledTimes(1)
            expect(refills).toHaveLength(4)
            expect(performed).toBe(true)
        })
    })

    describe('active customers', () => {
        it('correclly classified account types', () => {
            // Test all AccountType values
            const userBeta = newTestUser(0, AccountType.beta)
            expect(Business.isActiveCustomer(userBeta)).toBe(true)

            const userPrivate = newTestUser(0, AccountType.private)
            expect(Business.isActiveCustomer(userPrivate)).toBe(true)

            const userStudent = newTestUser(0, AccountType.student)
            expect(Business.isActiveCustomer(userStudent)).toBe(true)

            const userSimmer = newTestUser(0, AccountType.simmer)
            expect(Business.isActiveCustomer(userSimmer)).toBe(false)

            const userUnknown = newTestUser(0, AccountType.unknown)
            expect(Business.isActiveCustomer(userUnknown)).toBe(false)
        })
    })

    describe('monthlyRevenue', () => {
        it('should return correct revenue for each account type', () => {
            const userPrivate = newTestUser(0, AccountType.private)
            expect(Business.monthlyRevenue(userPrivate)).toBe(4.49)

            const userBeta = newTestUser(0, AccountType.beta)
            expect(Business.monthlyRevenue(userBeta)).toBe(3.49)

            const userStudent = newTestUser(0, AccountType.student)
            expect(Business.monthlyRevenue(userStudent)).toBe(2.99)

            const userSimmer = newTestUser(0, AccountType.simmer)
            expect(Business.monthlyRevenue(userSimmer)).toBe(0)

            const userUnknown = newTestUser(0, AccountType.unknown)
            expect(Business.monthlyRevenue(userUnknown)).toBe(0)
        })
    })

    describe('User upgrade', () => {
        it('from Simmer to Student', async () => {
            const user = newTestUser()
            user.customerId = 'customer-id'
            const mockUserDao = getMockUserDao(user)
            mockEmail.mockReset()
            mockUsage.mockReset()

            expect(user.maxTemplates).toEqual(MAX_TEMPLATE_SIMMER)
            expect(user.maxPages).toEqual(MAX_PAGES_SIMMER)
            expect(user.printCredits).toEqual(PRINT_CREDIT_SIMMER)

            await Business.upgradeUser(user.customerId, AccountType.student, 'pp1', mockUserDao)

            expect(user.maxTemplates).toEqual(MAX_TEMPLATE_STUDENT)
            expect(user.maxPages).toEqual(MAX_PAGES_STUDENT)
            expect(user.printCredits).toEqual(PRINT_CREDIT_STUDENT)

            expect(mockUserDao.updateType).toHaveBeenCalledTimes(1);
            expect(mockUserDao.updatePrintCredit).toHaveBeenCalledTimes(1);
            expect(Email.send).toHaveBeenCalledTimes(1);
            expect(UsageDao.refill).toHaveBeenCalledTimes(1);
        })

        it('from Simmer to Private', async () => {
            const user = newTestUser()
            user.customerId = 'customer-id'
            const mockUserDao = getMockUserDao(user)
            mockEmail.mockReset()
            mockUsage.mockReset()

            expect(user.maxTemplates).toEqual(MAX_TEMPLATE_SIMMER)
            expect(user.maxPages).toEqual(MAX_PAGES_SIMMER)
            expect(user.printCredits).toEqual(PRINT_CREDIT_SIMMER)

            await Business.upgradeUser(user.customerId, AccountType.private, 'pp2', mockUserDao)

            expect(user.maxTemplates).toEqual(MAX_TEMPLATE_PRIVATE)
            expect(user.maxPages).toEqual(MAX_PAGES_PRIVATE)
            expect(user.printCredits).toEqual(PRINT_CREDIT_PRIVATE)

            expect(mockUserDao.updateType).toHaveBeenCalledTimes(1);
            expect(mockUserDao.updatePrintCredit).toHaveBeenCalledTimes(1);
            expect(Email.send).toHaveBeenCalledTimes(1);
            expect(UsageDao.refill).toHaveBeenCalledTimes(1);
        })

        it('from Simmer to Lifetime', async () => {
            const user = newTestUser()
            user.customerId = 'customer-id'
            const mockUserDao = getMockUserDao(user)
            mockEmail.mockReset()
            mockUsage.mockReset()

            expect(user.maxTemplates).toEqual(MAX_TEMPLATE_SIMMER)
            expect(user.maxPages).toEqual(MAX_PAGES_SIMMER)
            expect(user.printCredits).toEqual(PRINT_CREDIT_SIMMER)

            await Business.upgradeUser(user.customerId, AccountType.lifetime, 'ld1', mockUserDao)

            expect(user.maxTemplates).toEqual(MAX_TEMPLATE_PRIVATE)
            expect(user.maxPages).toEqual(MAX_PAGES_PRIVATE)
            expect(user.printCredits).toEqual(PRINT_CREDIT_PRIVATE)

            expect(mockUserDao.updateType).toHaveBeenCalledTimes(1);
            expect(mockUserDao.updatePrintCredit).toHaveBeenCalledTimes(1);
            expect(Email.send).toHaveBeenCalledTimes(1);
            expect(UsageDao.refill).toHaveBeenCalledTimes(1);
        })


    })
});


