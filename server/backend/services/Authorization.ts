import { Request } from "express";
import { UserTools } from "../UserTools";
import { GApiError } from "../GApiError";
import { PlanService } from "./PlanService";
import { UserDao } from "../dao/UserDao";

export class Authorization {
    /**
     * Validates that the request is from an admin user.
     * @param req Express Request object
     * @returns The userId if the user is an admin
     * @throws GApiError(401) if not authorized
     */
    public static async validateAdmin(req: Request): Promise<number> {
        // console.debug('Validating admin for request', req)
        const userId = await UserTools.userIdFromRequest(req)
        if (!userId || !UserTools.isAdmin(userId)) {
            console.log(`User ${userId} is not authorized`)
            throw new GApiError(401, `Unauthorized admin request ${userId}`)
        }
        return userId
    }

    public static async validateHealthCheck(req: Request): Promise<void> {
        const healthCheckKey = process.env.HEALTH_CHECK_ACCESS_KEY
        const requestKey = req.headers['x-health-check-access-key']

        if (healthCheckKey && requestKey === healthCheckKey) {
            return
        }

        if (!healthCheckKey) {
            console.error('[Authorization] HEALTH_CHECK_ACCESS_KEY is missing on this server')
            // Don't fall back to admin validation if the key is missing to avoid confusion
            // and throw a specific message that the client can parse.
            throw new GApiError(401, 'HEALTH_CHECK_ACCESS_KEY not set on server')
        }

        if (!requestKey) {
            console.warn('[Authorization] Health check request missing x-health-check-access-key header')
        } else if (healthCheckKey !== requestKey) {
            console.warn('[Authorization] Health check key mismatch.')
        }

        await Authorization.validateAdmin(req)
    }

    /**
     * Validates that the request is from a user with NOTAM access.
     * @param req Express Request object
     * @returns The userId
     * @throws GApiError if not authorized
     */
    public static async validateNotamAccess(req: Request): Promise<number> {
        const userId = await UserTools.userIdFromRequest(req)
        if (!userId) {
            throw new GApiError(401, 'Please sign in to view notams')
        }
        const user = await new UserDao().get(userId)
        if (!user) throw new GApiError(401, 'User not found')

        const plan = PlanService.getPlan(user.planId)
        if (!plan?.features.notams) {
            throw new GApiError(403, 'Your plan does not include NOTAM access')
        }
        return userId
    }

    /**
     * Validates that the request is from a user with METAR access.
     * @param req Express Request object
     * @returns The userId
     * @throws GApiError if not authorized
     */
    public static async validateMetarAccess(req: Request): Promise<number> {
        const userId = await UserTools.userIdFromRequest(req)
        if (!userId) {
            throw new GApiError(401, 'Please sign in to view metar')
        }
        const user = await new UserDao().get(userId)
        if (!user) throw new GApiError(401, 'User not found')

        const plan = PlanService.getPlan(user.planId)
        if (!plan?.features.metars) {
            throw new GApiError(403, 'Your plan does not include METAR access')
        }
        return userId
    }
}
