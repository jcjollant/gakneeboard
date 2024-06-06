import postgres, { QueryResult } from "@vercel/postgres";

import {Airport} from "./Airport";

export class CustomAirport {
    static table:string = 'custom_airports';

    public static getId(airportCode:string,userId:number):string {
        if( !Airport.isValidCode(airportCode)) throw new Error('Invalid airport code');
        return airportCode.toUpperCase() + '-' + userId;
    }

    public static async count():Promise<number> {
        const result:QueryResult = await postgres.sql`SELECT COUNT(*) FROM custom_airports`;
        console.log( '[CustomAirport] count ' + JSON.stringify(result.rows[0]))
        return result.rows[0].count
    }

    public static async delete(airportId:string):Promise<void> {
        await postgres.sql`DELETE FROM ${CustomAirport.table} WHERE id=${airportId}`;
    }

    public static async update(airport:object, userId:number|undefined):Promise<void> {
        if( userId == undefined) throw new Error("Invalid user");
        const version:number = airport['version'];
        if( !Airport.isValidVersion(version)) throw new Error("Invalid airport version");
        const id = CustomAirport.getId(airport["code"], userId);
        const data = JSON.stringify(airport);
        await postgres.sql`INSERT INTO custom_airports (id,data,version) 
            VALUES (${id},${data},${version}) 
            ON CONFLICT (id) DO
            UPDATE SET data=${data}, version = ${version} WHERE id=${id}`;
    }

}