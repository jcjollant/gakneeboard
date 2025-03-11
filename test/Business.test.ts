
import { describe, expect, jest, it } from '@jest/globals'
import { AccountType } from '../backend/models/AccountType';
import { Business } from '../backend/business/Business';
import { getMockBrandNewSubscription, getMockSubscriptionDao, getMockUserDao, newTestUser } from './common';
import { Email } from '../backend/Email';
import { SubscriptionDao } from '../backend/dao/SubscriptionDao';
import { Subscription } from '../backend/models/Subscription';

// Mock the dependencies
jest.mock('../backend/dao/UserDao');
jest.mock('../backend/dao/SubscriptionDao');
jest.mock('../backend/Email');

describe('Business', () => {

    const mockEmail = jest.spyOn(Email, 'send').mockResolvedValue(true);
    const testUser = newTestUser();
    const testUserDao = getMockUserDao(testUser);
    const testSubsciption = getMockBrandNewSubscription()
    const testSubsciptionDao = getMockSubscriptionDao(testSubsciption)

    describe('calculatePrintCredits', () => {
        it('should return correct credits for simmer account', () => {
            const expectedRefill = 4
            const newUser = newTestUser()
            newUser.setAccountType( AccountType.simmer);
            newUser.printCredits = 0; // no credits
            const c0 = Business['calculatePrintCredits'](newUser);
            expect(c0).toBe(expectedRefill);
            newUser.printCredits = 2; // existing credits
            const c1 = Business['calculatePrintCredits'](newUser);
            expect(c1).toBe(expectedRefill);
            newUser.printCredits = 6; // existing credits higher than refill
            const c2 = Business['calculatePrintCredits'](newUser);
            expect(c2).toBe(6); // should not loose credits
            newUser.printCredits = -1; // weird credits
            const c3 = Business['calculatePrintCredits'](newUser);
            expect(c3).toBe(expectedRefill);
        });

        it('should return correct credits for private account', () => {
            const expectedRefill = 10
            const newUser = newTestUser()
            newUser.setAccountType( AccountType.private);
            newUser.printCredits = 0; // no credits
            const c1 = Business['calculatePrintCredits'](newUser);
            expect(c1).toBe(expectedRefill);
        });
    });

    describe('maxPagesFromAccountType', () => {
        it('should return 10 for beta account', () => {
            expect(Business.maxPagesFromAccountType(AccountType.beta)).toBe(10);
        });

        it('should return 5 for private account', () => {
            expect(Business.maxPagesFromAccountType(AccountType.private)).toBe(5);
        });

        it('should return 2 for simmer account', () => {
            expect(Business.maxPagesFromAccountType(AccountType.simmer)).toBe(2);
        });

        it('should return 0 for unknown account type', () => {
            expect(Business.maxPagesFromAccountType(AccountType.unknown)).toBe(0);
        });
    });

    describe('printConsume', () => {


        it('should decrease print credits for simmer account', async () => {
            const initialPrintCredit = 3
            const newUser = newTestUser();
            const mockUserDao = getMockUserDao(newUser);

            newUser.accountType = AccountType.simmer;
            newUser.printCredits = initialPrintCredit;

            const success = await Business.printConsume(newUser, mockUserDao);

            expect(success).toBe(true);
            expect(newUser.printCredits).toBe(initialPrintCredit - 1);
            expect(mockUserDao.updatePrintCredit).toHaveBeenCalledWith(newUser);
        });

        it('should fail simmer account without credit', async () => {
            const initialPrintCredit = 0
            const newUser = newTestUser();
            const mockUserDao = getMockUserDao(newUser);
            newUser.accountType = AccountType.simmer;
            newUser.printCredits = initialPrintCredit;

            const success = await Business.printConsume(newUser, mockUserDao);

            expect(success).toBe(false);
            expect(newUser.printCredits).toBe(initialPrintCredit);
            expect(mockUserDao.updatePrintCredit).not.toHaveBeenCalled();
        });

        it('should decrease print credits for private account', async () => {
            const initialPrintCredit = 1
            const newUser = newTestUser();
            const mockUserDao = getMockUserDao(newUser);
            newUser.accountType = AccountType.simmer;
            newUser.printCredits = initialPrintCredit;

            const success = await Business.printConsume(newUser, mockUserDao);

            expect(success).toBe(true);
            expect(newUser.printCredits).toBe(initialPrintCredit - 1);
            expect(mockUserDao.updatePrintCredit).toHaveBeenCalledWith(newUser);
        });

        it('should not decrease credits for beta account', async () => {
            const initialPrintCredit = 3;
            const newUser = newTestUser();
            const mockUserDao = getMockUserDao(newUser);
            newUser.accountType = AccountType.beta;
            newUser.printCredits = initialPrintCredit;

            const success = await Business.printConsume(newUser, mockUserDao);

            expect(success).toBe(true);
            expect(newUser.printCredits).toBe(initialPrintCredit);
            expect(mockUserDao.updatePrintCredit).not.toHaveBeenCalled();
        });

        it('should succeed beta account without credit', async () => {
            const initialPrintCredit = 0
            const newUser = newTestUser();
            const mockUserDao = getMockUserDao(newUser);
            newUser.accountType = AccountType.beta;
            newUser.printCredits = initialPrintCredit;

            const success = await Business.printConsume(newUser, mockUserDao);

            expect(success).toBe(true);
            expect(newUser.printCredits).toBe(initialPrintCredit);
            expect(mockUserDao.updatePrintCredit).not.toHaveBeenCalled();
        });

        it('should succeed beta account without using existing credit', async () => {
            const initialPrintCredit = 5
            const newUser = newTestUser();
            const mockUserDao = getMockUserDao(newUser);
            newUser.accountType = AccountType.beta;
            newUser.printCredits = initialPrintCredit;

            const success = await Business.printConsume(newUser, mockUserDao);

            expect(success).toBe(true);
            expect(newUser.printCredits).toBe(initialPrintCredit);
            expect(mockUserDao.updatePrintCredit).not.toHaveBeenCalled();
        });
    });

    describe('printPurchase', () => {
        it('should reject if customerId is empty', async () => {
            const newUser = newTestUser();
            const mockUserDao = getMockUserDao(newUser);
            await expect(Business.printPurchase('', 1, mockUserDao))
                .rejects.toEqual('Customer Id is required');
        });

        it('should reject if count is invalid', async () => {
            const newUser = newTestUser();
            const mockUserDao = getMockUserDao(newUser);
            await expect(Business.printPurchase('customer-id', 0, mockUserDao))
                .rejects.toEqual('Count is invalid');
        });

        it('should successfully purchase prints from all account type', async () => {
            const newUser = newTestUser();
            newUser.setAccountType(AccountType.beta);
            const mockUserDao = getMockUserDao(newUser);
            jest.spyOn(Email, 'send').mockResolvedValue(true);

            const result = await Business.printPurchase('customer-id', 5, mockUserDao);

            expect(result).toBe(newUser);
            expect(mockUserDao.getFromCustomerId).toHaveBeenCalledWith('customer-id');
            expect(mockUserDao.addPrints).toHaveBeenCalledWith(newUser, 5);
            expect(Email.send).toHaveBeenCalledTimes(1);

            newUser.setAccountType(AccountType.private);
            const result2 = await Business.printPurchase('customer-id', 5, mockUserDao);
            expect(result2).toBe(newUser);
            expect(Email.send).toHaveBeenCalledTimes(2);

            newUser.setAccountType(AccountType.simmer);
            const result3 = await Business.printPurchase('customer-id', 5, mockUserDao);
            expect(result3).toBe(newUser);
            expect(Email.send).toHaveBeenCalledTimes(3);
        });
    });

    describe('subscriptionUpdate', () => {
        it('should reject unknown account type', async () => {
            await expect(Business.subscriptionUpdate(
                'sub-id',
                'customer-id',
                'price-id',
                AccountType.unknown,
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
                AccountType.private,
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
                AccountType.beta,
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
            await expect( Business.subscriptionStop('', 'customer-id', mockUserDao)).rejects.toEqual('Subscription Id is required')
        })

        it('should reject invalid customer id', async () => {
            const user = newTestUser()
            const mockUserDao = getMockUserDao(user)
            await expect( Business.subscriptionStop('sub-id', '', mockUserDao)).rejects.toEqual('Customer Id is required')
        })

        it('should stop subscription', async () => {
            const user = newTestUser()
            user.accountType = AccountType.private
            const mockUserDao = getMockUserDao(user)
            await Business.subscriptionStop('customer-id', 'sub-id', mockUserDao).then( u => {
                // Account should be downgraded to simmer
                expect(u.accountType).toBe(AccountType.simmer)
            })
        })
    })

    describe('updateAccountType', () => {
        it( 'should call updateType and send email', async() => {
            const user = newTestUser()
            const mockUserDao = getMockUserDao(user)
            mockEmail.mockReset()

            await Business.updateAccountType(user, mockUserDao)

            expect(mockUserDao.updateType).toHaveBeenCalledTimes(1);
            expect(Email.send).toHaveBeenCalledTimes(1);
        })
    })

    describe('printRefills', () => {
        it('refill all accounts', async () => {
            const mockUserDao = getMockUserDao(newTestUser())
            await Business.printRefills(mockUserDao).then( () => {
                expect(mockUserDao.refill).toHaveBeenCalledTimes(2)
            })
        })
    })
});


