import { sql, VercelPool } from "@vercel/postgres";

export abstract class Dao<T> {
    protected abstract tableName:string;
    protected db:VercelPool;

    constructor() {
        this.db = sql;
    }

    public end() {
        this.db.end();
    }

    public count():Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            const query = `SELECT COUNT(*) FROM ${this.tableName}`;
            // console.log('[Dao.count]', query)
            try {
                const res = await this.db.query(query)
                resolve( Number(res.rows[0]?.count || 0))
            } catch (err) {
                console.log('[Dao.count] error ' + err)
                reject(err)
            }
        })
    }

    public get(id:number):Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            const query = `SELECT * FROM ${this.tableName} WHERE id = ${id}`;
            // console.log('[Dao.get]', query)
            try {
                const res = await this.db.query(query)
                resolve( this.parseRow(res.rows[0]) )
            } catch (err) {
                console.log('[Dao.get] error ' + err)
                reject(err)
            }
        })
    }

    // Return a new instance of the child class
    public abstract parseRow(row:any):T;
}
