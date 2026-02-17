import { sql } from "@vercel/postgres"

export class AdminTemplateService {
    /**
     * Promotes a user template to a system template by setting user_id to NULL
     * @param templateId The ID of the template to promote
     * @returns boolean indicating success
     */
    public static async promoteToSystem(templateId: number): Promise<boolean> {
        const result = await sql`
            UPDATE sheets 
            SET user_id = NULL 
            WHERE id = ${templateId}
        `
        return (result.rowCount ?? 0) > 0
    }
}
