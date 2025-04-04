import { jest } from '@jest/globals'
import { UserDao } from "../backend/dao/UserDao"
import { User } from "../backend/models/User"
import { UserTools } from "../backend/UserTools"
import { Subscription } from '../backend/models/Subscription'
import { SubscriptionDao } from '../backend/dao/SubscriptionDao'
import { Refill } from '../backend/models/Refill'
import { AccountType } from '../backend/models/AccountType'
import { Business } from '../backend/business/Business'

export function getMockUserDao(user:User):UserDao {
    const mockUserDao = new UserDao() as jest.Mocked<UserDao>;
    jest.spyOn(mockUserDao, 'updatePrintCredit').mockResolvedValue()
    jest.spyOn(mockUserDao, 'getFromCustomerId').mockResolvedValue(user);
    jest.spyOn(mockUserDao, 'addPrints').mockResolvedValue(user);
    jest.spyOn(mockUserDao, 'updateType').mockResolvedValue();
    const refills = [1,2,3,4].map(i => new Refill(i, i, 5))
    jest.spyOn(mockUserDao, 'refill').mockResolvedValue(refills);

    return mockUserDao
}

export function getMockSubscriptionDao(sub:Subscription):SubscriptionDao {
    const mockSubscriptionDao = new SubscriptionDao() as jest.Mocked<SubscriptionDao>;
    jest.spyOn(mockSubscriptionDao, 'update').mockResolvedValue(sub);

    return mockSubscriptionDao
}

export function getMockBrandNewSubscription():Subscription {
    const mockSubscription = new Subscription('sub-id','customer-id', 'price-id') as jest.Mocked<Subscription>;
    jest.spyOn(mockSubscription, 'isBrandNew').mockReturnValue(true);

    return mockSubscription;
}

export function newTestUser(userId:number=0, accoutType:AccountType=AccountType.simmer):User {
    const userName = Math.random().toString(36).substring(5)
    const newEmail = Math.random().toString(36).substring(7) + '@test.com'
    const newHash = UserTools.createUserSha('test', newEmail)
    const newUser = new User(userId, newHash)
    newUser.email = newEmail
    newUser.name = userName
    newUser.source = 'test'
    // assign random value between 1 and 25
    newUser.setPrintCredits(Math.floor(Math.random() * 25) + 1)
    
    // max either 2, 5 or 10
    // const max = [2,5,10]
    // newUser.setMaxTemplates(max[Math.floor(Math.random() * max.length)])
    newUser.setMaxTemplates(Business.maxTemplatesFromAccountType(accoutType))

    return newUser
}

export function brandNewUser() {
    const user = newTestUser()
    user.printCredits = 0;
    user.maxTemplates = 0;
    return user

}