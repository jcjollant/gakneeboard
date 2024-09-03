const express =require( "express")
import cors from "cors";
// const cors = require('cors');
import { version } from '../backend/constants.js'
import { GApi, GApiError } from '../backend/GApi'
import { UserTools } from '../backend/UserTools'
import { AirportView } from "../backend/models/AirportView";
import { FeedbackDao } from "../backend/FeedbackDao";
import { Maintenance } from '../backend/Maintenance'
const port = 3000
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

app.get("/", async (req, res) => {
    const user = await UserTools.userMiniFromRequest(req)
    const output = {
        version: version,
        aced: GApi.getAirportCurrentEffectiveDate(),
        camv: AirportView.currentVersion,
    }
    // console.log('[index.get.root]', user, output)
    if(user) {
        output.user = user
    }
    res.send(output)
});

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

app.get("/airport/:id", async (req,res) => {
    const userId = await UserTools.userIdFromRequest(req)
    // console.log( "[index.get.airport]", req.params.id, userId);

    GApi.getAirportView(req.params.id, userId)
        .then( (airport) => {
            //console.log("[index] Returning airport " + JSON.stringify(airport));
            res.send(airport)
        }).catch( (e) => {
            catchError(res, e, 'GET /airport/:id')
        })
})

/**
 * Get a list of airports represented as AirportView
 */
app.get('/airports/:list', async (req, res) => {

    const userId = await UserTools.userIdFromRequest(req)
    // console.log( "[index] /airports/", req.params.list, "userId", userId);
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
    await FeedbackDao.save(payload)
    res.send("Thank you for your feedback")
})

app.get('/maintenance/:code', async (req, res) => {
    const maintenance = new Maintenance(req.params.code)
    if(maintenance.isValidCode() === false) {
        // console.log('[index] Invalid maintenance code')
        res.status(404).send()
        return
    }
    maintenance.perform().then( (result) => {
        res.send(result)
    }).catch(e => {
        catchError(res, e, 'GET /maintenance/:code')
    })
})

app.get(['/sheet/:id','/template/:id'], async (req, res) => {
    const userId = await UserTools.userIdFromRequest(req)
    try {
        // console.log( "[index] GET template " + req.params.id + " userId " + userId);
        if(!userId) {
            throw new GApiError(401, 'Unauthorized')
        }
        // console.log( "[index] GET template " + req.params.id + " userId " + userId
        let sheet = await GApi.templateGet(req.params.id, userId);
        res.send(sheet)
    } catch( e) {
        catchError(res, e, 'GET /template/:id')
    }
})

app.get(['/sheetbycode/:code','/publication/:code'], async (req, res) => {
    try {
        let sheet = await GApi.publicationGet(req.params.code);
        res.send(sheet)
    } catch( e) {
        catchError(res, e, 'GET /publication/:code')
    }
})

/**
 * Builds a template list for the current user
 */
app.get(['/sheets','/templates'], async (req, res) => {
    const userId = await UserTools.userIdFromRequest(req)
    try {
        const sheets = await GApi.templateGetList(userId);
        res.send(sheets)
    } catch( e) {
        catchError(res, e, 'GET /sheets')
    }
})

/**
 * The expected payload is a user and template data
 */
app.post(['/sheet','/template'], async (req, res) => {
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    GApi.templateSave(payload.user, payload.sheet).then( (template) => {
        // console.log('[index.post/sheet]', JSON.stringify(sheet))
        res.send(template)
    }).catch( (e) => {
        catchError(res, e, 'POST /sheet')
    })
})

app.delete(['/sheet/:id','/template/:id'], async (req, res) => {
    const sheetId = req.params.id
    const userId = await UserTools.userIdFromRequest(req)
    try {
        if( !sheetId || !userId) { 
            throw new GApiError(400, 'Invalid request')
        }
        await GApi.templateDelete(sheetId, userId).then( (sheet) => {
            res.send(sheet.name + ' deleted')
        })
    } catch( e) {
        catchError(res, e, 'DELETE /sheet/:id')
    }
    // console.log( "[index] DELETE sheet " + req.params.id
})

app.get('/sunlight/:from/:to/:dateFrom/:dateTo?', async (req, res) => {
    try {
        // const sunlight = await GApi.getSunlight(req.params.from, req.params.to, req.params.date);
        // console.log( "[index] Returning sunlight " + JSON.stringify(sunlight));
        // res.send(sunlight)

        GApi.getSunlight(req.params.from, req.params.to, req.params.dateFrom, req.params.dateTo)
        .then( sunlight => {
            res.send(sunlight)
        })
    } catch(e) {
        console.log(e)
        catchError(res, e, 'GET /sunlight/:from/:to/:date')
    }        
})

if(process.env.__VERCEL_DEV_RUNNING != "1") {
    app.listen(port, () => console.log("[index] Server ready on port " + port));
}

/**
 * Prints an error in the console and send an error response
 * @param {*} res 
 * @param {*} e 
 * @param {*} msg 
 */
function catchError(res, e, msg) {
    // console.log( "[index] " + msg + " error " + JSON.stringify(e))
    if( e instanceof GApiError) {
        res.status(e.status).send(e.message)
    } else {
        res.status(500).send(e)
    }
}

export default app;
