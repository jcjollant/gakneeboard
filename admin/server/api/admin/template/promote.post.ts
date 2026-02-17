import { defineEventHandler, readBody, createError } from 'h3'
import { AdminTemplateService } from '../../../services/AdminTemplateService'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const templateId = Number(body.templateId)

        if (!templateId || isNaN(templateId)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Invalid templateId provided'
            })
        }

        const success = await AdminTemplateService.promoteToSystem(templateId)

        if (!success) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Template not found or already a system template'
            })
        }

        return { success: true, message: `Template ${templateId} promoted to system template` }
    } catch (e: any) {
        if (e.statusCode) throw e
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to promote template: ' + (e.message || e)
        })
    }
})
