import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { UserDao } from '@server/backend/dao/UserDao'

export default defineEventHandler(async (event) => {
    const idParam = getRouterParam(event, 'id')
    if (!idParam) throw createError({ statusCode: 400, statusMessage: 'Missing ID param' })
    const userId = Number(idParam)

    const body = await readBody(event)
    const printRefillOverride = body.printRefillOverride !== undefined ? body.printRefillOverride : undefined

    if (printRefillOverride === undefined) {
        throw createError({ statusCode: 400, statusMessage: 'Missing printRefillOverride param' })
    }

    const dao = new UserDao()
    let user;
    if (isNaN(userId)) {
        user = await UserDao.getUserFromHash(idParam)
    } else {
        user = await dao.get(userId)
    }

    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

    user.setPrintRefillOverride(printRefillOverride === null ? undefined : Number(printRefillOverride))

    // Note: To cleanly update just this column without needing a full save overwrite
    // we should execute a specific update query on the DAO or use save(user, true) if save is safe.
    try {
        await dao.updatePrintRefillOverride(user)
        return { success: true, printRefillOverride: user.printRefillOverride }
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to update print refill override ' + err.message })
    }
})
