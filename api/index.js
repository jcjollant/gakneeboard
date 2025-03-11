const express = require( "express")
import cors from "cors";
import multer from "multer"
// const cors = require('cors');
import { GApi, GApiError } from '../backend/GApi'
import { StripeClient } from '../backend/business/Stripe'
import { UserTools } from '../backend/UserTools'
import { Maintenance } from '../backend/Maintenance'
import { NavlogTools } from "../backend/NavlogTools";
import { Ticket } from "../backend/Ticket";
const port = 3000
const app = express();

app.use(cors())
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
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
    const output = await GApi.getSession(req)
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
 * Get approach plate PDF
 */
app.get('/approach/plate/:cycle/:fileName', async (req, res) => {
    // console.log('[index] /test')
    try {
        const cycle = req.params.cycle
        const fileName = req.params.fileName
        GApi.getAeronavPdf(cycle,fileName).then(image => {
            // console.log('[index] approach length', image.length)
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
            })
            res.send(image)
        });
    } catch( e) {
        console.log('[index] /approach error' + e)
        catchError(res, e, 'GET /approach')
    }
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

/**
 * Get airport diagram PDF
 */
app.get('/diagram/:cycle/:fileName', async (req, res) => {
    // console.log('[index] /test')
    try {
        const cycle = req.params.cycle
        const fileName = req.params.fileName
        GApi.getAeronavPdf(cycle,fileName).then(image => {
            // console.log('[index] approach length', image.length)
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
            })
            res.send(image)
        });
    } catch( e) {
        console.log('[index] GET /diagram error' + e)
        catchError(res, e, 'GET /diagram')
    }
})



// Trigger download of a template export in various formats
app.get('/export/template/:id/:format', async(req,res) => {
    // console.log('[index.get/export/template/', req.params.id, req.params.format, req.query.user)
    try {
        await GApi.exportTemplate(req.params.id, req.query?.user, req.params.format).then( (e) => {
            res.attachment(e.fileName)
            const arrayBuffer = e.arrayBuffer
            res.header('Access-Control-Expose-Headers', 'Content-Disposition');
            // console.log('[index] export template', arrayBuffer.byteLength)
            res.send(Buffer.from(arrayBuffer))
        })
    } catch(e) {
        console.log('[index] /export error' + e)
        catchError(res, e, 'GET /export/template')
    }
})

// record user feedback
app.post('/feedback', async(req,res) => {
    // console.log( "API feedback request " + req);
    // console.log( "[index] feedback body " + JSON.stringify(req.body));
    // console.log( "[index] feedback body type " + typeof req.body);
    // insert feedback in DB
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    await GApi.feedbackSave(payload).then(() => {
        // send notification email
        res.send("Thank you for your feedback")
    })
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
        let template = await GApi.publicationGet(req.params.code);
        res.send(template)
    } catch( e) {
        catchError(res, e, 'GET /publication/:code')
    }
})

app.post('/print', async (req, res) => {
    try {
        const payload = (typeof req.body !== 'string' ? JSON.stringify(req.body) : req.body);
        const userSha = UserTools.userShaFromRequest(req)
        const success = await GApi.printRequest(userSha,payload)
        res.sendStatus( success ? 200 : 402)
    } catch( err) {
        catchError(res, e, 'POST /print')
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
 * Payments management
 */
app.post('/stripe/checkout', async (req,res) => {
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    let promise = null;
    if(payload.product === 'manage') {
        promise = StripeClient.instance.manage(payload.user, payload.source)
    } else {
        promise = StripeClient.instance.checkout(payload.user, payload.product, payload.source)
    }
    await promise.then( (url) => {
        res.send({url: url})
    }).catch( (e) => {
        catchError(res, e, 'POST /checkout')
    })
})

/**
 * This is called by Stripe upon subscription event
 */
app.post('/stripe/webhook', async (req, res) => {
    await StripeClient.instance.webhook(req).then(() => {
        res.send()
    }).catch( (e) => {
        console.log(e)
        res.status(400).send()
    })
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
        let template = await GApi.templateGet(req.params.id, userId);
        if(template) {
            res.send(template)
        } else {
            res.sendStatus(404)
        }
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
        const templates = await GApi.templateGetList(userId);
        res.send(templates)
    } catch( e) {
        catchError(res, e, 'GET /templates')
    }
})

// Template update
app.post('/template', async (req, res) => {
    // console.log('[index.post/template]', typeof req.body)
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    // console.log("[index] POST template payload " + JSON.stringify(payload))
    GApi.templateSave(payload.user, payload.sheet).then( (template) => {
        // console.log('[index.post/sheet]', JSON.stringify(sheet))
        res.send(template)
    }).catch( (e) => {
        catchError(res, e, 'POST /template')
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
        if(e instanceof GApiError && e.status === 404) {
            res.sendStatus(e.status)
            return
        } else {
            catchError(res, e, 'DELETE /template/:id')
        }
    }
    // console.log( "[index] DELETE sheet " + req.params.id
})

app.get('/sunlight/:from/:to/:dateFrom/:dateTo?', async (req, res) => {
    try {
        await GApi.getSunlight(req.params.from, req.params.to, req.params.dateFrom, req.params.dateTo).then( sunlight => {
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
        Ticket.create(4, e.message)
    } else {
        res.status(500).send(e)
        Ticket.create(4, e)
    }
}

export default app;
