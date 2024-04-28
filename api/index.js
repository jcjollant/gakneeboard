const express = require("express");
const app = express();
import {airports} from '../assets/data.js'
import { sql } from "@vercel/postgres";
import { fetch } from './adip.js'

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
        console.log( airportCode + " not found in ADIP");
        // TODO, create a record in postgres for this code
        res.status(404).send("Airport not found in DB nor ADIP");
    }
})

app.listen(3004, () => console.log("Server ready on port 3000."));

module.exports = app;

async function getAirport(airportCode,icaoCode) {
    console.log( "getAirport DB for " + airportCode + "/" + icaoCode);
    let airport = null;
    if( icaoCode) { // try locId and icao
        const icaoCode = 'K'+airportCode;
        airport = await sql`SELECT Data FROM Airports WHERE Code in (${airportCode},${icaoCode})`;
    } else {
        airport = await sql`SELECT Data FROM Airports WHERE Code= ${airportCode}`;
    }

    if( airport.rows.length > 0) { // happy path, airport was not found in postgres
        console.log( "found " + airportCode + ' in DB');
        // console.log( JSON.stringify(result.rows[0]))
        airport = JSON.parse(airport.rows[0].data);
    } else {
        airport = await fetch(airportCode);
        if(airport) { // adip saves the day, persist this airport in postrgres
            console.log( "found " + airportCode + ' in ADIP');
            // console.log( JSON.stringify(airport));
            await sql`INSERT INTO Airports (Code, Data) VALUES (${airport['code']}, ${airport})`;
        }

    }
    return airport;
}