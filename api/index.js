const express =require( "express")
import cors from "cors";
// const cors = require('cors');
const db = require('../backend/db.js');
import { GApi } from '../backend/gapi'
import { UserTools } from '../backend/UserTools'

const port = 3002
const app = express();
const version = 615

app.use(cors())

// console.log("Dev Mode")
// app.use((req, res, next) => {
//     const showHeaders = false;
//     let before = Date.now();
//     let thisRequest = before % 100;
//     if( showHeaders ) {
//         console.log(`${thisRequest}: ${req.method}, ${req.originalUrl}, `, req.headers);
//     } else {
//         console.log(`${thisRequest}: ${req.method}, ${req.originalUrl}, `);
//     }
//     // watchs for end of theresponse
//     res.on('close', () => {
//         let after = Date.now();
//         if( showHeaders) {
//             console.log(`${thisRequest}: status=${res.statusCode}, outbound headers: `, res.getHeaders());
//         } else {
//             console.log(`${thisRequest}: status=${res.statusCode}, time=${after-before}`);
//         }
//     });
//     next();
// });

app.get("/", (req, res) => res.send("GA API version " + version));

app.get("/airport/:id", async (req,res) => {
    // console.log( "[index.get.airport] " + req.params.id);

    const userId = await UserTools.userFromRequest(req)

    try {
        let airport = await GApi.getAirport(req.params.id, userId);
        if( airport) {
            res.send(airport)
        } else {
            res.status(404).send("Airport not found");
        }
    } catch( e) {
        console.log( "[index] airport error " + e)
        if( 'status' in e) {
            res.status(e.status).send(e.message)
        } else {
            res.status(500).send(e)
        }
    }
})

/**
 * Create a new custom airport
 */
app.post("/airport", async (req,res) => {
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    // console.log("[index] POST airport payload " + JSON.stringify(payload))
    try {
        const code = await GApi.createCustomAirport(payload.user, payload.airport)
        res.send(code + ' created')
    } catch( e) {
        console.log( "[index] POST airport error " + e)
        res.status(500).send(e)
    }
})

app.get('/airports/:list', async (req, res) => {

    const userId = await UserTools.userFromRequest(req)
    // console.log( "[index] /airports/ " + req.params.list);
    const airports = await GApi.getAirportsList(req.params.list.split('-'),userId);
    // console.log( "[index] Returning airports " + JSON.stringify(airports));
    res.send(airports)
})

/**
 * User is autenticating
 */
app.post('/authenticate', async(req,res) => {
    // console.log( "[index] authenticate request ");
    // console.log( "[index] authenticate body " + req.body);
    try {
        const user = await UserTools.authenticate(req.body)
        res.send(user.getMini())
    } catch( e) {
        res.status(400).send("SignIn failed : " + e)
    }
})

app.post('/feedback', async(req,res) => {
    console.log( "API feedback request " + req);
    console.log( "[index] feedback body " + JSON.stringify(req.body));
    console.log( "[index] feedback body type " + typeof req.body);
    // insert feedback in DB
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    await db.saveFeedback(payload)
    res.send("Thank you for your feedback")
})

app.listen(port, () => console.log("[index] Server ready on port " + port));

export default app;
