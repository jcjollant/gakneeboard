const express = require("express");
const app = express();
import {airports} from '../assets/data.js'
import { sql } from "@vercel/postgres";
import { fetch } from './adip.js'

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/airport/:id", async (req,res) => {
    const airportCode = req.params.id.toUpperCase();
    console.log( "API airport request " + airportCode);
    if(airportCode.length != 3 && airportCode.length != 4) {
        console.log( "Invalid airport code length " + airportCode);
        res.status(400).send("Invalid airport ID");
    } else {
        let airport = await getAirportFromDb(airportCode);
        if( airport) {
            res.send(airport)
        } else {
            console.log( "not found in DB, trying ADIP");
            airport = await fetch(airportCode);
            if(airport) { // adip saves the day, persist this airport in postrgres
                console.log( "found " + airportCode + ' in ADIP');
                // console.log( JSON.stringify(airport));
                await sql`INSERT INTO Airports (Code, Data) VALUES (${airport['code']}, ${airport})`;
                res.send(airport);
            } else { // airport not found in adip either
                console.log( airportCode + " not found in ADIP");
                // TODO, create a record in postgres for this code
                res.status(404).send("Airport not found in DB nor ADIP");
            }
        }
    }
})

app.listen(3004, () => console.log("Server ready on port 3000."));

module.exports = app;

async function getAirportFromDb(airportCode) {
    // console.log( "trying DB for " + airportCode);
    let result = null;
    if( airportCode.length == 3) { // try locId and icao
        const icaoCode = 'K'+airportCode;
        result = await sql`SELECT Data FROM Airports WHERE Code in (${airportCode},${icaoCode})`;
    } else {
        result = await sql`SELECT Data FROM Airports WHERE Code= ${airportCode}`;
    }
    if( result.rows.length > 0) { // happy path, airport was not found in postgres
        console.log( "found " + airportCode + ' in DB');
        // console.log( JSON.stringify(result.rows[0]))
        return JSON.parse(result.rows[0].data);
    }
    return null;
}