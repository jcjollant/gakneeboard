import { UsageType } from "@gak/shared";
import { UsageDao } from "./dao/UsageDao";
import { UserDao } from "./dao/UserDao";
import { UserProfile } from "./models/UserProfile";
import { TemplateDao } from "./TemplateDao";
import { GApiError } from "./GApiError";

export class Admin {
    static async getUserProfile(userId: number): Promise<UserProfile> {
        // Email
        // Name
        // Account type
        // Usage 90 days
        // Template count
        // Page count
        const userDao = new UserDao()
        const usageDao = new UsageDao()
        const templateDao = new TemplateDao()

        try {
            const [user, usage, lastSession, templateCount] = await Promise.all([
                userDao.get(userId),
                usageDao.userUsageCountSince(userId, 90),
                usageDao.lastUsageDate(userId, UsageType.Session),
                templateDao.countForUser(userId)
            ])

            if (!user) {
                throw new GApiError(404, 'User not found')
            }

            const [pageCount] = await templateDao.pageCount(userId, 0)
            const userProfile = new UserProfile(user, usage, templateCount, pageCount, lastSession || undefined);

            return userProfile
        } catch (error) {
            if (error instanceof GApiError) {
                throw error
            }
            // If database query fails (e.g., user doesn't exist), throw 404
            throw new GApiError(404, 'User not found')
        }
    }

}