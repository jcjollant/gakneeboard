import { Request } from "express";
import { UserTools } from "../UserTools";
import { GApiError } from "../GApiError";

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
            throw new GApiError(401, "Unauthorized")
        }
        return userId
    }
}
