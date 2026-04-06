import { Dao } from "./Dao";
import { Housekeeping } from "../models/Housekeeping";

export class HousekeepingDao extends Dao<Housekeeping> {
    protected tableName: string = "housekeeping";

    public parseRow(row: any): Housekeeping {
        return new Housekeeping(
            row.id,
            row.create_time,
            row.data,
            row.failed,
            row.passed,
            row.skipped
        );
    }

    public async insert(data: any, failed: number, passed: number, skipped: number): Promise<Housekeeping> {
        const query = `
            INSERT INTO ${this.tableName} (data, failed, passed, skipped)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const res = await this.db.query(query, [JSON.stringify(data), failed, passed, skipped]);
        return this.parseRow(res.rows[0]);
    }

    public async getAll(): Promise<Housekeeping[]> {
        const query = `SELECT * FROM ${this.tableName} ORDER BY create_time DESC`;
        const res = await this.db.query(query);
        return res.rows.map(row => this.parseRow(row));
    }
}
