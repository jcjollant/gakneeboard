const express =require( "express")
import cors from "cors";
import multer from "multer"
// const cors = require('cors');
import { version } from '../backend/constants.js'
import { GApi, GApiError } from '../backend/GApi'
import { UserTools } from '../backend/UserTools'
import { AirportView } from "../backend/models/AirportView";
import { FeedbackDao } from "../backend/FeedbackDao";
import { Maintenance } from '../backend/Maintenance'
import { NavlogTools } from "../backend/NavlogTools";
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

app.get('/export/template/:id/:format', async(req,res) => {
    const blob = AceWritter.demo()
    res.attachment('kneeboard.ace')
    // const download = Buffer.from(fileData, 'base64')
    res.end(blob)
})

// record user feedback
app.post('/feedback', async(req,res) => {
    // console.log( "API feedback request " + req);
    // console.log( "[index] feedback body " + JSON.stringify(req.body));
    // console.log( "[index] feedback body type " + typeof req.body);
    // insert feedback in DB
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    await FeedbackDao.save(payload)
    res.send("Thank you for your feedback")
})


var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

app.post('/fp2nl', upload.single('file'), async (req,res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
//   console.log('[index.POST fp2nl]', req.file.buffer.length)
    try {
        res.send(await NavlogTools.importFlightPlan(req.file.buffer))
    } catch( e) {
        catchError(res, e, 'POST /fp2nl')
    }
});

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

app.get('/publication/:code', async (req, res) => {
    try {
        let sheet = await GApi.publicationGet(req.params.code);
        res.send(sheet)
    } catch( e) {
        catchError(res, e, 'GET /publication/:code')
    }
})

// Get a list of publications
app.get('/publications', async (req, res) => {
    // Require authenticated user
    const userId = await UserTools.userIdFromRequest(req)
    try {
        if(!userId) {
            throw new GApiError(401, 'Please Sign In to access this resource')
        }
        let pubs = await GApi.publicationGetList();
        res.send(pubs)
    } catch( e) {
        catchError(res, e, 'GET /publications')
    }
})

/**
 * Get a specific template
 */
app.get('/template/:id', async (req, res) => {
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

/**
 * Builds a template list for the current user
 */
app.get('/templates', async (req, res) => {
    const userId = await UserTools.userIdFromRequest(req)
    try {
        const sheets = await GApi.templateGetList(userId);
        res.send(sheets)
    } catch( e) {
        catchError(res, e, 'GET /sheets')
    }
})

// Template update
app.post('/template', async (req, res) => {
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    GApi.templateSave(payload.user, payload.sheet).then( (template) => {
        // console.log('[index.post/sheet]', JSON.stringify(sheet))
        res.send(template)
    }).catch( (e) => {
        catchError(res, e, 'POST /sheet')
    })
})

// Delete a specific template
app.delete('/template/:id', async (req, res) => {
    const templateId = req.params.id
    const userId = await UserTools.userIdFromRequest(req)
    try {
        if( !templateId || !userId) { 
            throw new GApiError(400, 'Invalid request')
        }
        await GApi.templateDelete(templateId, userId).then( (template) => {
            res.send(template.name + ' deleted')
        })
    } catch( e) {
        catchError(res, e, 'DELETE /template/:id')
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
