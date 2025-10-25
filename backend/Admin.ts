import { UsageDao } from "./dao/UsageDao";
import { UserDao } from "./dao/UserDao";
import { UserProfile } from "./models/UserProfile";
import { TemplateDao } from "./TemplateDao";

export class Admin {
    static async getUserProfile(userId: number):Promise<UserProfile> {
        // Email
        // Name
        // Account type
        // Usage 90 days
        // Template count
        // Page count
        const userDao = new UserDao()
        const usageDao = new UsageDao()
        const templateDao = new TemplateDao()
        const [user, usage, templateCount] = await Promise.all([
            userDao.get(userId), 
            usageDao.userUsageCountSince(userId, 90),
            templateDao.countForUser(userId)
        ])
        const [pageCount] = await templateDao.pageCount(userId, 0)
        const userProfile = new UserProfile(user, usage, templateCount, pageCount);

        return userProfile
    }

}