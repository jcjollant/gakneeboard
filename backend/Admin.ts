import { UsageDao } from "./dao/UsageDao";
import { UserDao } from "./dao/UserDao";
import { UserProfile } from "./models/UserProfile";

export class Admin {
    static async getUserProfile(userId: number):Promise<UserProfile> {
        // Email
        // Name
        // Account type
        // Usage 90 days
        const userDao = new UserDao()
        const usageDao = new UsageDao()
        const [user, usage] = await Promise.all([
            userDao.get(userId), 
            usageDao.userUsageCountSince(userId, 90),
        ])
        const userProfile = new UserProfile(user, usage);

        return userProfile
    }

}