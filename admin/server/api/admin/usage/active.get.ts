import { defineEventHandler, getQuery } from 'h3'
import { UsageDao } from '@server/backend/dao/UsageDao'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const daysParam = query.days

    if (!daysParam) {
        throw createError({ statusCode: 400, statusMessage: 'Missing days param' })
    }

    const days = Number(daysParam)
    if (isNaN(days)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid days param' })
    }

    const usageDao = new UsageDao()
    const activeUserIds = await usageDao.getActiveUsersLastDays(days)

    return activeUserIds
})
