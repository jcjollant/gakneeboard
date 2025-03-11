import { sql } from '@vercel/postgres';
import { User } from '../models/User'
import { Dao } from './Dao';
import { AccountType } from '../models/AccountType';
import { Refill } from '../models/Refill';

export class UserDao extends Dao<User> {
    protected tableName: string = 'users';
    modelVersion:number = 2;

    public async addPrints(user:User, count: number):Promise<User> {
        return new Promise<User>(async (resolve, reject) => {
            // console.log('[UserDao.addPrints]', query)
            try {
                const query = `UPDATE ${this.tableName} SET print_credit = print_credit + ${count} WHERE id = ${user.id} RETURNING *`;
                const res = await this.db.query(query)
                resolve( this.parseRow(res.rows[0]) )
            } catch (err) {
                console.log('[UserDao.addPrints] error ' + err)
                reject(err)
            }
        })
    }

    public getAll():Promise<User[]> {
        const dao = new UserDao()
        return new Promise( async (resolve, reject) => {
            const result = await sql`SELECT id,sha256,data FROM users`;
            const users:User[] = []
            for(const row of result.rows) {
                users.push(dao.parseRow(row))
            }
            resolve(users)
        })
    }

    /**
     * Fetches a user by sha256 and return its Id
     * @param userSha User sha256
     * @returns User Id
     */
    public static async getIdFromHash(userSha:string):Promise<number | undefined> {
        // console.log( '[UserDao] find user with sha256 ' + sha256)
        const result = await sql`SELECT id FROM users WHERE sha256=${userSha}`;
        // console.log( '[UserDao] found ' + result.rowCount + ' entries')
    
        if( result.rowCount == 0) return undefined

        // console.log( '[db] fetchAirportList found ' + JSON.stringify(result.rows[0]))
        return result.rows[0].id
    }

    public async getFromHash(userSha: string): Promise<User|undefined> {
        const result = await sql`SELECT * FROM users WHERE sha256=${userSha}`;
        if( result.rowCount == 0) return undefined
        return this.parseRow(result.rows[0])
    }

    public getFromCustomerId(customerId:string):Promise<User> {
        const dao = new UserDao()
        return new Promise<User>(async (resolve, reject) => {
            const result = await this.db.query(`SELECT * FROM ${this.tableName} WHERE customer_id='${customerId}'`);
            if( result.rowCount != 1) return reject('Unexpected user count ' + result.rowCount + ' customer_id' + customerId)
            resolve(dao.parseRow(result.rows[0]))
        })
    }

    // builds a user using the sha256 as a key
    public static async getUserFromHash(sha256:string):Promise<User | undefined> {
        const dao = new UserDao()
        return dao.getFromHash(sha256)
    }

    // creates a user from it's data representation
    public parseRow(row:any):User {
        // console.log('[UserDao.parseRow]', id, sha256, accountType)
        const user = new User(Number(row.id), row.sha256)
        const data = JSON.parse(row.data)
        if(data.source) user.setSource(data.source)
        if(data.email) user.setEmail(data.email)
        if(data.name) user.setName(data.name)
        if(data.maxTemplates) user.setMaxTemplates(data.maxTemplates)
        user.setAccountType(row.account_type)
        user.setCustomerId(row.customer_id)
        user.setPrintCredits(row.print_credit || 0)

        return user
    }

    /**
     * Refill print credits for a given account type
     * @param count Number of credits to add
     * @param accountType Account type to refill
     * @returns List of refills
     */ 
    public async refill(count:number, accountType:string):Promise<Refill[]> {
        const r1 = await sql`SELECT id,print_credit FROM users WHERE account_type=${accountType} AND print_credit < ${count}`
        if( r1.rowCount == 0) return [] // no users to refill

        const r2 = await sql`UPDATE users SET print_credit=${count} WHERE account_type=${accountType} AND print_credit < ${count}`
        const refills:Refill[] = r1.rows.map( r => new Refill(r.id, r.print_credit, count))

        return refills
    }

    /**
     * Saves a user to the database
     * @param user
     * @throws Error if sha256 is missing
     */

    public async save(user:User, overwrite:boolean=false):Promise<User> {
        // console.log( '[UserDao.save]  ' + JSON.stringify(user))
        return new Promise<User>(async (resolve, reject) => {
            if( !user.sha256) return reject('sha256 missing')

            // Do we know this user?
            const result = await this.db.query(`SELECT id from ${this.tableName} WHERE sha256 = '${user.sha256}'`);
            // console.log( '[UserDao.save] match count ' + result.rowCount)
            if(result.rowCount == 0) {
                // console.log( '[UserDao.save] adding ' + user.sha256)
                const insert = await this.db.query(`INSERT INTO ${this.tableName} (sha256,data,version,account_type) VALUES ('${user.sha256}','${JSON.stringify(user)}',${this.modelVersion},'${user.accountType}') RETURNING id`)
                user.id = insert.rows[0].id
                // console.log( '[UserDao.save] ' + user.sha256)
            } else if( overwrite){ // this user is known but we can override
                // console.log( '[UserDao.save] known user ' + user.sha256)
                user.id = result.rows[0].id
                await this.db.query(`UPDATE ${this.tableName} SET data = '${JSON.stringify(user)}', version=${this.modelVersion}, account_type='${user.accountType}' WHERE id = ${user.id}`)
            } else {
                return reject('Cannot save existing user without overwrite')
            }
            resolve( user)
        })
    }

    // Update and existing user with a new customer_id
    static async updateCustomerId(user:User):Promise<boolean> {
        console.log( '[UserDao.updateCustomerId] ' + user.id + ' to ' + user.customerId)
        const result = await sql`UPDATE users SET customer_id=${user.customerId} WHERE id=${user.id}`
        return result.rowCount == 1;
    }

    public updatePrintCredit(user:User):Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                if(user.printCredits < 0) throw new Error('Negative print credit')
                const result = await sql`UPDATE users SET print_credit=${user.printCredits} WHERE id=${user.id}`
                if(result.rowCount == 1) {
                    resolve()
                } else {
                    reject('Matching users ' + result.rowCount)
                }
            } catch(err) {
                console.log( '[UserDao.updatePrintCredit] ' + user.id + ' to ' + user.printCredits + ' failed ' + err)
                reject(err)
            }
        })
    }

    // Update and existing user with a new account_type
    public updateType(user:User):Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const result = await sql`UPDATE users SET account_type=${user.accountType} WHERE id=${user.id}`
                if(result.rowCount == 1) {
                    resolve()
                } else {
                    reject('Matching users ' + result.rowCount)
                }
            } catch(err) {
                console.log( '[UserDao.updateType] ' + user.id + ' to: ' + user.accountType + ' failed ' + err)
                reject(err)
            }
        })
    }

}