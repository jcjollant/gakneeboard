import express from "express";
import cors from "cors";
import {airports} from '../assets/data.js'
import { sql } from '@vercel/postgres';
import { fetch } from './adip.js'

const app = express();
const port = 3001

app.use(cors());

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/airport/:id", async (req,res) => {
    console.log( "API airport request " + req.params.id);
    let airportCode = null;
    let icaoCode = null;
    if( req.params.id.length == 4) {
        airportCode = req.params.id.substring(1).toUpperCase();
        icaoCode = req.params.id.toUpperCase();
    } else if( req.params.id.length == 3) {
        airportCode = req.params.id.toUpperCase();
        icaoCode = 'K' + airportCode;
    } else {
        console.log( "Invalid airport code length " + airportCode);
        res.status(400).send("Invalid airport ID");
        return;
    }

    let airport = await getAirport(airportCode,icaoCode);
    if( airport) {
        res.send(airport)
    } else {
        console.log( airportCode + " unknown");
        // TODO, create a record in postgres for this code
        res.status(404).send("Airport not found");
    }
})

app.listen(port, () => console.log("Server ready on port " + port));

export default app;

async function getAirport(airportCode,icaoCode) {
    // console.log( "getAirport DB for " + airportCode + "/" + icaoCode);
    let result = null;
    if( icaoCode) { // try locId and icao
        const icaoCode = 'K'+airportCode;
        result = await sql`SELECT Data FROM Airports WHERE Code in (${airportCode},${icaoCode})`;
    } else {
        result = await sql`SELECT Data FROM Airports WHERE Code= ${airportCode}`;
    }

    let airport = null;
    if( result.rows.length > 0) { // happy path, airport was not found in postgres
        // console.log( JSON.stringify(result.rows[0]))
        if(result.rows[0].data != '{}') {
            console.log( "found " + airportCode + ' in DB');
            airport = JSON.parse(result.rows[0].data);
        } else {
            console.log( airportCode + " found but it's a lemon")
            airport = null;
        }
    } else { // Try ADIP
        airport = await fetch(airportCode);
        if(airport) { // adip saves the day, persist this airport in postrgres
            console.log( "found " + airportCode + ' in ADIP');
            // console.log( JSON.stringify(airport));
            await sql`INSERT INTO Airports (Code, Data) VALUES (${airport['code']}, ${airport})`;
        } else { // not found ADIP either, memorize to avoid asking this over and over
            console.log( "Saving " + airportCode + ' in DB as lemon');
            sql`INSERT INTO Airports (Code, Data) VALUES (${airportCode}, '{}')`;
        }

    }
    return airport;
}