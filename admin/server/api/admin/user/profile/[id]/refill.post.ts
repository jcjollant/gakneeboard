import { defineEventHandler, getRouterParam, createError } from 'h3'
import { UserDao } from '@server/backend/dao/UserDao'
import { User } from '@server/backend/models/User'

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

    // Add 100 prints
    try {
        const updatedUser = await dao.addPrints(user, 100)
        return {
            success: true,
            printCredits: updatedUser.printCredits
        }
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to add prints: ' + err.message })
    }
})
