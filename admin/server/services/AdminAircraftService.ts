import { sql } from "@vercel/postgres"

export class AdminAircraftService {
    /**
     * Promotes a user aircraft to a system template or creates a system copy
     * @param aircraftId The ID of the aircraft to promote/copy
     * @param tailNumber The new system-wide tail number (template name)
     * @param copy Whether to create a new record (true) or update the existing one (false)
     * @returns boolean indicating success
     */
    public static async promoteAircraft(aircraftId: number, tailNumber: string, copy: boolean): Promise<boolean> {
        if (copy) {
            // Create a new system aircraft by copying data from the source
            const result = await sql`
                INSERT INTO aircrafts (user_id, tail_number, data)
                SELECT NULL, ${tailNumber}, data 
                FROM aircrafts 
                WHERE id = ${aircraftId}
            `
            return (result.rowCount ?? 0) > 0
        } else {
            // Update the existing aircraft to be a system aircraft
            const result = await sql`
                UPDATE aircrafts 
                SET user_id = NULL, tail_number = ${tailNumber} 
                WHERE id = ${aircraftId}
            `
            return (result.rowCount ?? 0) > 0
        }
    }
}
