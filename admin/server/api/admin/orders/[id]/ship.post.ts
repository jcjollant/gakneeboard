import { defineEventHandler, getRouterParam } from 'h3'
import { PrintOrderDao } from '@server/backend/dao/PrintOrderDao'
import { PrintOrderStatus } from '@gak/shared'

export default defineEventHandler(async (event) => {
    try {
        const id = getRouterParam(event, 'id')
        if (!id) {
            throw createError({ statusCode: 400, statusMessage: 'Missing ID param' })
        }

        await PrintOrderDao.updateStatus(id, PrintOrderStatus.SHIPPED)
        return { status: 'SHIPPED', id }
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to ship order: ' + e.message
        })
    }
})
