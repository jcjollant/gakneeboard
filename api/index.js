import express from "express";
import cors from "cors";
const gapi = require('../datasource/gapi.js');

const app = express();
const port = 3002

app.use(cors());

// let requestCntr = 0;
// app.use((req, res, next) => {
//     let thisRequest = requestCntr++;
//     console.log(`${thisRequest}: ${req.method}, ${req.originalUrl}, `, req.headers);
    // watch for end of theresponse
    // res.on('close', () => {
    //     console.log(`${thisRequest}: close response, res.statusCode = ${res.statusCode}, outbound headers: `, res.getHeaders());
    // });
//     next();
// });

app.get("/", (req, res) => res.send("Express on Vercel"));

app.get("/airport/:id", async (req,res) => {
    console.log( "[index] airport request " + req.params.id);
    const airportCode = req.params.id.toUpperCase()
    // basic code validation
    if( !gapi.isValidCode(airportCode)) {
        res.status(400).send("Invalid airport ID");
        return;
    }

    let airport = await gapi.getAirport(airportCode);
    if( airport) {
        res.send(airport)
    } else {
        res.status(404).send("Airport not found");
    }
})

app.get('/airports/:list', async (req, res) => {
    // console.log( "API airports request");
    const airports = await gapi.getAirportsList(req.params.list.split('-'));
    // console.log( "[index] Returning airports " + JSON.stringify(airports));
    res.send(airports)
})

app.listen(port, () => console.log("Server ready on port " + port));

export default app;
