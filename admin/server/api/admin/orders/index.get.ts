import { defineEventHandler } from 'h3'
import { PrintOrderDao } from '@server/backend/dao/PrintOrderDao'

export default defineEventHandler(async (event) => {
    try {
        const orders = await PrintOrderDao.listOpenOrders()
        return orders
    } catch (e: any) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch orders: ' + e.message
        })
    }
})
