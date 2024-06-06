import express from "express";
import { version } from "../backend/data.js"
// import cors from "cors";
const cors = require('cors');
const db = require('../backend/db.js');
const gapi = require('../backend/gapi.js');
const users = require('../backend/users.js');

const port = 3002
const app = express();

// const corsOptions = {
//     origin: "*",
//     methods: "GET,POST,OPTIONS",
//     credentials: true,
//     allowHeaders: 'Authorization,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
//     optionsSuccessStatus: 200
// }
// app.use(cors(corsOptions))

app.use(cors())
// app.use(express.json())

// if( process.env.NODE_ENV == 'development') {
    // console.log("Dev Mode")
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

// }    


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

/**
 * Create a new custom airport
 */
app.post("/airport", async (req,res) => {
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    // console.log("[index] POST airport payload " + JSON.stringify(payload))
    try {
        gapi.createCustomAirport(payload.user, payload.airport)
        res.send(airport.code + ' created')
    } catch( e) {
        res.status(500).send( e)
    }
})

app.get('/airports/:list', async (req, res) => {
    // console.log( "API airports request");
    const airports = await gapi.getAirportsList(req.params.list.split('-'));
    // console.log( "[index] Returning airports " + JSON.stringify(airports));
    res.send(airports)
})

/**
 * User is autenticating
 */
app.post('/authenticate', async(req,res) => {
    // console.log( "[index] authenticate request ");
    // console.log( "[index] authenticate body " + req.body);
    const user = await users.authenticate(req.body)
    if( user) {
        res.send(user)
    } else {
        res.status(400).send("SignIn failed")
    }
})

app.post('/feedback', async(req,res) => {
    // console.log( "API feedback request " + req);
    // console.log( "[index] feedback body " + JSON.stringify(req.body));
    // console.log( "[index] feedback body type " + typeof req.body);
    // insert feedback in DB
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    await db.saveFeedback(payload)
    res.send("Thank you for your feedback")
})

app.listen(port, () => console.log("[index] Server ready on port " + port));

export default app;
