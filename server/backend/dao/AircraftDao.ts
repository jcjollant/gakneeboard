import { Aircraft } from '@gak/shared';
import { Dao } from './Dao';

export class AircraftDao extends Dao<Aircraft> {
    protected tableName: string = 'aircrafts';

    public async save(aircraft: Partial<Aircraft> & { userId: number, tailNumber: string, make: string, model: string, data: any }): Promise<Aircraft> {
        if (aircraft.id) {
            // Update
            const query = `
                UPDATE ${this.tableName}
                SET tail_number = $1, make = $2, model = $3, data = $4, updated_at = CURRENT_TIMESTAMP
                WHERE id = $5 AND user_id = $6
                RETURNING *
            `;
            const res = await this.db.query(query, [
                aircraft.tailNumber,
                aircraft.make,
                aircraft.model,
                JSON.stringify(aircraft.data),
                aircraft.id,
                aircraft.userId
            ]);
            if (res.rowCount === 0) throw new Error('Aircraft not found or access denied');
            return this.parseRow(res.rows[0]);
        } else {
            // Insert
            const query = `
                INSERT INTO ${this.tableName} (user_id, tail_number, make, model, data)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            const res = await this.db.query(query, [
                aircraft.userId,
                aircraft.tailNumber,
                aircraft.make,
                aircraft.model,
                JSON.stringify(aircraft.data)
            ]);
            return this.parseRow(res.rows[0]);
        }
    }

    public async listForUser(userId: number): Promise<Aircraft[]> {
        const query = `SELECT * FROM ${this.tableName} WHERE user_id = $1 ORDER BY tail_number ASC`;
        const res = await this.db.query(query, [userId]);
        return res.rows.map(row => this.parseRow(row));
    }

    public async listTemplates(): Promise<Aircraft[]> {
        const query = `SELECT * FROM ${this.tableName} WHERE user_id IS NULL ORDER BY tail_number ASC`;
        const res = await this.db.query(query);
        return res.rows.map(row => this.parseRow(row));
    }

    public async getByTailNumber(userId: number, tailNumber: string): Promise<Aircraft | undefined> {
        const query = `SELECT * FROM ${this.tableName} WHERE user_id = $1 AND tail_number = $2`;
        const res = await this.db.query(query, [userId, tailNumber]);
        if (res.rowCount === 0) return undefined;
        return this.parseRow(res.rows[0]);
    }

    public async deleteAircraft(userId: number, id: number): Promise<boolean> {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1 AND user_id = $2`;
        const res = await this.db.query(query, [id, userId]);
        return res.rowCount === 1;
    }

    public parseRow(row: any): Aircraft {
        return {
            id: row.id,
            userId: row.user_id,
            tailNumber: row.tail_number,
            make: row.make,
            model: row.model,
            data: row.data 
        };
    }
}
