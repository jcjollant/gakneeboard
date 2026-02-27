import { defineEventHandler, getQuery, createError } from 'h3'
import { AdminReportService } from '../../../services/AdminReportService'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const daysParam = query.days

    let days = 7
    if (daysParam) {
        days = Number(daysParam)
        if (isNaN(days)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid days param' })
        }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
        const report = await AdminReportService.getLowHangingFruits(startDate)
        return report
    } catch (err: any) {
        throw createError({ statusCode: 500, statusMessage: 'Failed to fetch report: ' + err.message })
    }
})
