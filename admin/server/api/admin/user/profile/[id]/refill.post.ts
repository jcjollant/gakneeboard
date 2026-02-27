import { defineEventHandler, getRouterParam, createError } from 'h3'
import { UserDao } from '@server/backend/dao/UserDao'
import { User } from '@server/backend/models/User'
import { Business } from '@server/backend/business/Business'
import { UsageDao } from '@server/backend/dao/UsageDao'

export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, 'id')
    if (!idParam) {
        throw createError({ statusCode: 400, statusMessage: 'Missing ID param' })
    }

    const userId = Number(idParam)
    const dao = new UserDao()

    // Check if ID is a sha256 hash or numeric ID
    let user: User | undefined;
    if (isNaN(userId)) {
        user = await UserDao.getUserFromHash(idParam)
    } else {
        user = await dao.get(userId)
    }

    if (!user) {
        throw createError({ statusCode: 404, statusMessage: 'User not found' })
    }

    const previousCredits = user.printCredits
    const newCredits = Business.calculatePrintCredits(user)

    if (newCredits === -1) {
        return {
            success: true,
            message: 'User has unlimited prints',
            printCredits: -1
        }
    }

    if (newCredits <= previousCredits) {
        return {
            success: true,
            message: 'User already has full or extra credits',
            printCredits: previousCredits
        }
    }

    try {
        user.printCredits = newCredits
        await dao.updatePrintCredit(user)
        await UsageDao.refill(user.id, previousCredits, newCredits)

        return {
            success: true,
            printCredits: newCredits
        }
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to refill prints: ' + err.message })
    }
})
