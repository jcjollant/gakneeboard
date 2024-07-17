const version = 712

const express =require( "express")
import cors from "cors";
// const cors = require('cors');
const db = require('../backend/db.js');
import { GApi, GApiError } from '../backend/GApi'
import { UserTools } from '../backend/UserTools'
import { HealthCheck } from "../backend/HealthChecks";

const port = 3002
const app = express();

app.use(cors())
app.use(express.json()) // for parsing application/json

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
    const userId = await UserTools.userFromRequest(req)
    // console.log( "[index.get.airport]", req.params.id, userId);

    GApi.getAirportView(req.params.id, userId)
        .then( (airport) => {
            res.send(airport)
        }).catch( (e) => {
            catchError(res, e, 'GET /airport/:id')
        })
})

/**
 * Create a new custom airport
 */
app.post("/airport", async (req,res) => {
    console.log('[index.post.airport]', typeof req.body)
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    // console.log("[index] POST airport payload " + JSON.stringify(payload))
    if( !payload.user || !payload.airport ) {
        res.status(400).send('Invalid request')
        return
    }
    await GApi.createCustomAirport(payload.user, payload.airport).then( (code) => {
        res.status(201).send(code + ' created')
    }).catch( (e) => {
        catchError(res, e, 'POST /airport')
    })
})

app.get('/airports/:list', async (req, res) => {

    const userId = await UserTools.userFromRequest(req)
    // console.log( "[index] /airports/ " + req.params.list);
    const airports = await GApi.getAirportViewList(req.params.list.split('-'),userId);
    // console.log( "[index] Returning airports " + JSON.stringify(airports));
    res.send(airports)
})

/**
 * User is autenticating
 */
app.post('/authenticate', async(req,res) => {
    // console.log( "[index] authenticate request ");
    // console.log( "[index] authenticate body " + req.body);
    await GApi.authenticate(req.body).then( (user) => {
        res.send(user)
    }).catch( (e) => {
        catchError(res, e, 'POST /authenticate')
    })
})

// record user feedback
app.post('/feedback', async(req,res) => {
    console.log( "API feedback request " + req);
    console.log( "[index] feedback body " + JSON.stringify(req.body));
    console.log( "[index] feedback body type " + typeof req.body);
    // insert feedback in DB
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    await db.saveFeedback(payload)
    res.send("Thank you for your feedback")
})


app.get('/housekeeping/willie', async (req,res) => {
    await HealthCheck.perform().then( (result) => {
        res.send(result)
    })
})

app.get('/sheet/:id', async (req, res) => {
    const userId = await UserTools.userFromRequest(req)
    try {
        let sheet = await GApi.sheetGetData(req.params.id, userId);
        res.send(sheet)
    } catch( e) {
        catchError(res, e, 'GET /sheet/:id')
    }
})

app.get('/sheets', async (req, res) => {
    const userId = await UserTools.userFromRequest(req)
    try {
        const sheets = await GApi.sheetGetList(userId);
        res.send(sheets)
    } catch( e) {
        catchError(res, e, 'GET /sheets')
    }
})

/**
 * The expected payload is a user and a sheet
 */
app.post('/sheet', async (req, res) => {
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    GApi.sheetSave(payload.user, payload.sheet).then( (sheet) => {
        res.send(sheet)
    }).catch( (e) => {
        catchError(res, e, 'POST /sheet')
    })
})

app.delete('/sheet/:id', async (req, res) => {
    const sheetId = req.params.id
    const userId = await UserTools.userFromRequest(req)
    try {
        if( !sheetId || !userId) { 
            throw new GApiError(400, 'Invalid request')
        }
        await GApi.sheetDelete(sheetId, userId).then( (sheet) => {
            res.send(sheet.name + ' deleted')
        })
    } catch( e) {
        catchError(res, e, 'DELETE /sheet/:id')
    }
    // console.log( "[index] DELETE sheet " + req.params.id
})

app.get('/sunlight/:from/:to/:date', async (req, res) => {
    try {
        // const sunlight = await GApi.getSunlight(req.params.from, req.params.to, req.params.date);
        // console.log( "[index] Returning sunlight " + JSON.stringify(sunlight));
        // res.send(sunlight)

        GApi.getSunlight(req.params.from, req.params.to, req.params.date).then( sunlight => {
            res.send(sunlight)
        })
    } catch(e) {
        console.log(e)
        catchError(res, e, 'GET /sunlight/:from/:to/:date')
    }        
})

app.listen(port, () => console.log("[index] Server ready on port " + port));

/**
 * Prints an error in the console and send an error response
 * @param {*} res 
 * @param {*} e 
 * @param {*} msg 
 */
function catchError(res, e, msg) {
    console.log( "[index] " + msg + " error " + JSON.stringify(e))
    if( e instanceof GApiError) {
        res.status(e.status).send(e.message)
    } else {
        res.status(500).send(e)
    }
}


export default app;
