import express from "express";
// import cors from "cors";
import { version } from "../backend/data.js"
const cors = require('cors');
const db = require('../backend/db.js');
const gapi = require('../backend/gapi.js');

const port = 3002
const app = express();

const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200

}
app.use(cors(corsOptions))
// app.use(cors())

app.use((req, res, next) => {
    const showHeaders = false;
    let thisRequest = Date.now();
    if( showHeaders ) {
        console.log(`${thisRequest}: ${req.method}, ${req.originalUrl}, `, req.headers);
    } else {
        console.log(`${thisRequest}: ${req.method}, ${req.originalUrl}, `);
    }
    // watchs for end of theresponse
    res.on('close', () => {
        if( showHeaders) {
            console.log(`${thisRequest}: close response, res.statusCode = ${res.statusCode}, outbound headers: `, res.getHeaders());
        } else {
            console.log(`${thisRequest}: close response, res.statusCode = ${res.statusCode}`);
        }
    });
    next();
});

app.use(express.json())


app.get("/", (req, res) => res.send("GA API version " + version));

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

app.post('/authenticate', async(req,red) => {
    console.log( "API authenticate request " + req);
    console.log( "API authenticate body " + req.body);
    res.send("OK")
})

app.post('/feedback', async(req,res) => {
    // console.log( "API feedback request " + req);
    console.log( "API feedback body " + JSON.stringify(req.body));
    // insert feedback in DB
    const data = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    await db.saveFeedback(data)
    res.send("Thank you for your feedback")
})

app.listen(port, () => console.log("Server ready on port " + port));

export default app;
