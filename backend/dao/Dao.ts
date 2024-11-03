import { sql } from "@vercel/postgres";

export class Dao {
    protected table:string = ''
    constructor(table: string) {
        this.table = table
        // console.log('[Dao.constructor]', this.table)
    }

    public async count():Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            const query = "SELECT COUNT(*) FROM " + this.table;
            // console.log('[Dao.count]', query)
            sql.query(query)
                .then( res => {
                    resolve(Number(res.rows[0].count))
                })
                .catch( err => reject(err))
        })
    }
}
