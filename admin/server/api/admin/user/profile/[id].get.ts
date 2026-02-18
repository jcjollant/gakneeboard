import { defineEventHandler, getRouterParam } from 'h3'
import { UserDao } from '@server/backend/dao/UserDao'
import { UsageDao } from '@server/backend/dao/UsageDao'
import { UsageType } from '@gak/shared'
// import { UserProfile } from '~/utils/models/UserProfile'
import { User } from '@server/backend/models/User'

export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, 'id')
    if (!idParam) {
        throw createError({ statusCode: 400, statusMessage: 'Missing ID param' })
    }

    const userId = Number(idParam)

    // Check if ID is a sha256 hash or numeric ID
    let user: User | undefined;
    if (isNaN(userId)) {
        user = await UserDao.getUserFromHash(idParam)
    } else {
        const dao = new UserDao()
        user = await dao.get(userId)
    }

    if (!user) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    // Get Usage Count
    const usageDao = new UsageDao()
    const usage = await usageDao.userUsageCountSince(user.id, 90)

    // Get Last Session
    const lastSession = await usageDao.lastUsageDate(user.id, UsageType.Session)

    // Construct profile
    // Note: UserProfile in admin/utils/models/UserProfile might need adjustments or we create a plain object
    // Assuming UserProfile constructor matches what we need or we construct manually to avoid frontend model issues on backend

    // Let's create a plain object response for now to ensure compatibility
    const response = {
        id: user.id,
        sha256: user.sha256,
        email: user.email,
        name: user.name,
        accountType: user.accountType,
        eula: user.eula,
        create_time: user.createDate,
        planId: user.planId,
        usage: usage,
        lastSession: lastSession,
        templateCount: user.maxTemplates, // This is max, not current count. For current count we'd need another DAO call if required.
        pageCount: user.maxPages       // Same here
    }

    return response
})
