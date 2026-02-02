import express, { Request, Response } from "express"
import cors from "cors";
import multer from "multer"
import { AirportService } from "../backend/services/AirportService";
import { Admin } from "../backend/Admin"
import { GApi } from '../backend/GApi'
import { StripeClient } from '../backend/business/Stripe'
import { UserTools } from '../backend/UserTools'
import { Maintenance } from '../backend/Maintenance'
import { NavlogTools } from "../backend/NavlogTools";
import { TicketService } from "../backend/services/TicketService";
import { Charts } from "../backend/Charts";
import { TemplateService } from "../backend/services/TemplateService"
import { PublicationService } from "../backend/services/PublicationService";
import { GApiError } from "../backend/GApiError";
import { UserImage } from "../backend/UserImage";
import { UserDao } from "../backend/dao/UserDao";
import { UsageDao } from "../backend/dao/UsageDao";
import { Authorization } from "../backend/services/Authorization";
import { NotamService } from "../backend/services/NotamService";
import { WeatherService } from "../backend/services/WeatherService";
const port: number = 3000
const app = express();

app.use(cors())
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json()) // for parsing application/json

// console.log("Dev Mode")
// app.use((req:Request, res:Response, next) => {
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

app.get('/', async (req: Request, res: Response) => {
    const output = await GApi.getSession(req)
    res.send(output)
});

/**
 * Create a new airport (Admin only)
 */
app.post('/airport', async (req: Request, res: Response) => {
    try {
        const userId = await Authorization.validateAdmin(req)

        // payload is in body.request
        const payload = req.body.request
        // const payload: AirportCreationRequest = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const airport = await AirportService.createAirport(payload)
        res.status(201).send(airport)
    } catch (e) {
        catchError(res, e, 'POST /airport')
    }
})

app.get('/airport/:id', async (req, res) => {
    const userId = await UserTools.userIdFromRequest(req)
    // console.log( "[index.get.airport]", req.params.id, userId);

    try {
        const output = await AirportService.getAirportView(req.params.id, userId)
        res.send(output)
    } catch (e) {
        catchError(res, e, 'GET /airport')
    }
})

/**
 * Get a list of airports represented as AirportView
 */
app.get('/airports/:list', async (req: Request, res: Response) => {

    const userId = await UserTools.userIdFromRequest(req)
    // console.log( "[index] /airports/", req.params.list, "userId", userId);
    const output = await AirportService.getAirportViewList(req.params.list.split('-'), userId);
    // console.log( "[index] Returning airports " + JSON.stringify(airports));
    res.send(output)
})

/**
 * Get approach plate PDF
 */
app.get('/approach/plate/:cycle/:fileName', async (req: Request, res: Response) => {
    // console.log('[index] /test')
    try {
        const fullName = req.params.cycle + '/' + req.params.fileName
        Charts.getAeronavPdf(fullName).then(pdfBuffer => {
            // console.log('[index] approach length', image.length)
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
            })
            res.send(pdfBuffer.toString('base64'))
        });
    } catch (e) {
        console.log('[index] GET /approach error' + e)
        catchError(res, e, 'GET /approach')
    }
})

/**
 * User is autenticating
 */
app.post('/authenticate', async (req, res) => {
    // console.log( "[index] authenticate request ");
    // console.log( "[index] authenticate body " + req.body);
    await GApi.authenticate(req.body).then((user) => {
        res.send(user)
    }).catch((e) => {
        catchError(res, e, 'POST /authenticate')
    })
})

/**
 * Get airport diagram PDF
 */
app.get('/diagram/:cycle/:fileName', async (req: Request, res: Response) => {
    // console.log('[index] /test')
    try {
        const fullName = req.params.cycle + '/' + req.params.fileName
        Charts.getAeronavPdf(fullName).then(pdfBuffer => {
            // console.log('[index] approach length', image.length)
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline',
                'Cache-Control': 'no-cache'
            })
            res.send(pdfBuffer.toString('base64'))
        });
    } catch (e) {
        console.log('[index] GET /diagram error' + e)
        catchError(res, e, 'GET /diagram')
    }
})

app.post('/eula', async (req, res) => {
    // console.debug('[index] /eula', req.body)
    const userId = await UserTools.userIdFromRequest(req)
    if (!userId) {
        res.status(400).send('Invalid request')
        return
    }
    // read version from request body
    const version = req.body.version
    await GApi.acceptEula(userId, version).then((result) => {
        res.send(result)
    }).catch((e) => {
        catchError(res, e, 'POST /eula')
    })
})

// Trigger download of a template export in various formats
app.get('/export/template/:id/:format', async (req: Request, res: Response) => {
    // console.log('[index.get/export/template/', req.params.id, req.params.format, req.query.user)
    try {
        if (!req.query.user) throw new Error('user is required')
        const user: string = req.query.user as string
        await GApi.exportTemplate(Number(req.params.id), user, req.params.format).then((e) => {
            res.attachment(e.fileName)
            const arrayBuffer = e.arrayBuffer
            res.header('Access-Control-Expose-Headers', 'Content-Disposition');
            // console.log('[index] export template', arrayBuffer.byteLength)
            res.send(Buffer.from(arrayBuffer))
        })
    } catch (e) {
        catchError(res, e, 'GET /export/template')
    }
})

// record user feedback
app.post('/feedback', async (req, res) => {
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

app.post('/fp2nl', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    //   console.log('[index.POST fp2nl]', req.file.buffer.length)
    try {
        res.send(await NavlogTools.importFlightPlan(req.file.buffer))
    } catch (e) {
        catchError(res, e, 'POST /fp2nl')
    }
});

app.get('/maintenance/:code', async (req: Request, res: Response) => {
    const maintenance = new Maintenance(req.params.code)
    if (maintenance.isValidCode() === false) {
        // console.log('[index] Invalid maintenance code')
        res.status(404).send()
        return
    }
    maintenance.perform().then((result) => {
        res.send(result)
    }).catch(e => {
        catchError(res, e, 'GET /maintenance/:code')
    })
})

/**
 * Get Metar for an airport
 */
app.get('/metar/:airportCode', async (req: Request, res: Response) => {
    try {
        const airportCode = req.params.airportCode
        const userId = await UserTools.userIdFromRequest(req)
        if (!userId) {
            res.status(401).send({ error: `Please sign in to view metar` })
            return
        }

        const metar = await WeatherService.getMetar({
            ids: airportCode,
            format: 'json'
        })
        if (Array.isArray(metar) && metar.length > 0) {
            res.send(metar[0])
        } else {
            res.status(404).send('No METAR found')
        }
    } catch (e) {
        catchError(res, e, 'GET /metar/:airportCode')
    }
})

/**
 * Get simplified NOTAMs for an airport
 */
app.get('/notams/:airportCode', async (req: Request, res: Response) => {
    try {
        const airportCode = req.params.airportCode
        const userId = await UserTools.userIdFromRequest(req)
        if (!userId) {
            res.status(401).send({ error: `Please sign in to view notams` })
            return
        }

        const simplified = await NotamService.getSimplifiedNotams({
            location: airportCode
        })
        res.send(simplified)
    } catch (e) {
        // if this is a 404, just return
        catchError(res, e, 'GET /notam/:airportCode')
    }
})


app.get('/publication/:code', async (req: Request, res: Response) => {
    try {
        const template = await PublicationService.get(req.params.code);
        if (template) {
            res.send(template)
        } else {
            res.status(404).send("Publication not found")
        }
    } catch (e) {
        catchError(res, e, 'GET /publication/:code')
    }
})

app.post('/print', async (req: Request, res: Response) => {
    try {
        const payload = (typeof req.body !== 'string' ? JSON.stringify(req.body) : req.body);
        const userSha = UserTools.userShaFromRequest(req)
        const success = await GApi.printRequest(userSha, payload)
        res.sendStatus(success ? 200 : 402)
    } catch (err) {
        catchError(res, err, 'POST /print')
    }
})


// Get a list of publications
app.get('/publications', async (req: Request, res: Response) => {
    // Require authenticated user
    const userId = await UserTools.userIdFromRequest(req)
    try {
        if (!userId) {
            throw new GApiError(401, 'Please Sign In to access this resource')
        }
        let pubs = await PublicationService.getList();
        res.send(pubs)
    } catch (e) {
        catchError(res, e, 'GET /publications')
    }
})

/**
 * Payments management
 */
app.post('/stripe/checkout', async (req, res) => {
    // console.debug('[index] POST /stripe/checkout', req.body)
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    let promise = null;
    if (payload.product === 'manage') {
        promise = StripeClient.instance.manage(payload.user, payload.source)
    } else {
        promise = StripeClient.instance.checkout(payload.user, payload.product, payload.source, payload.attribution)
    }
    await promise.then((url) => {
        res.send({ url: url })
    }).catch((e) => {
        catchError(res, e, 'POST /checkout')
    })
})

/**
 * This is called by Stripe upon subscription event
 */
app.post('/stripe/webhook', async (req: Request, res: Response) => {
    await StripeClient.instance.webhook(req).then(() => {
        res.send()
    }).catch((e) => {
        console.log(e)
        res.status(400).send()
    })
})


/**
 * Get a specific template
 */
app.get('/template/:id', async (req: Request, res: Response) => {
    const requester = await UserTools.userIdFromRequest(req)
    try {
        // console.log( "[index] GET template " + req.params.id + " userId " + userId);
        const templateId = Number(req.params.id)
        if (!requester) {
            throw new GApiError(401, `Unauthorized Template request ${templateId}`)
        }
        // console.log( "[index] GET template " + req.params.id + " userId " + userId
        let template = await TemplateService.get(templateId, requester);
        if (template) {
            res.send(template)
        } else {
            res.sendStatus(404)
        }
    } catch (e) {
        catchError(res, e, 'GET /template/:id')
    }
})

/**
 * Get a specific version of a template
 */
app.get('/template/:id/version/:version', async (req: Request, res: Response) => {
    try {
        const requester = await UserTools.userIdFromRequest(req)
        const templateId = Number(req.params.id)
        const version = Number(req.params.version)
        if (!requester) {
            throw new GApiError(401, `Unauthorized template version request ${templateId} v${version}`)
        }

        const template = await TemplateService.getVersion(templateId, version, requester)
        if (template) {
            res.send(template)
        } else {
            res.sendStatus(404)
        }
    } catch (e) {
        catchError(res, e, 'GET /template/:id/version/:version')
    }
})

/**
 * Builds a template list for the current user
 */
app.get('/templates', async (req: Request, res: Response) => {
    const userId = await UserTools.userIdFromRequest(req)
    try {
        const templates = await TemplateService.getList(userId);
        res.send(templates)
    } catch (e) {
        catchError(res, e, 'GET /templates')
    }
})

// Template save
app.post('/template', async (req: Request, res: Response) => {
    // console.log('[index.post/template]', typeof req.body)
    const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    // console.log("[index] POST template payload " + JSON.stringify(payload))
    TemplateService.save(payload.user, payload.sheet).then((status) => {
        // console.log('[index.post/sheet]', JSON.stringify(sheet))
        res.status(status.code).send(status.template)
    }).catch((e) => {
        if (e instanceof GApiError && e.status == 402) {
            TicketService.create(5, 'User ' + payload.user.id + ' cannot save template ' + payload.sheet.id + ': ' + e.message)
            res.status(e.status).send(e.message)
        } else {
            catchError(res, e, 'POST /template')
        }
    })
})

// Delete a specific template
app.delete('/template/:id', async (req: Request, res: Response) => {
    try {
        const templateId = Number(req.params.id)
        const userId = await UserTools.userIdFromRequest(req)

        if (!templateId || !userId) {
            throw new GApiError(400, 'Invalid request')
        }
        await TemplateService.delete(templateId, userId).then((template) => {
            res.send(template + ' deleted')
        })
    } catch (e) {
        if (e instanceof GApiError && e.status === 404) {
            res.sendStatus(e.status)
            return
        } else {
            catchError(res, e, 'DELETE /template/:id')
        }
    }
    // console.log( "[index] DELETE sheet " + req.params.id
})

app.post('/templateThumbnail', upload.single('image'), async (req: Request, res: Response) => {
    try {
        const userId = await UserTools.userIdFromRequest(req)
        const templateId = Number(req.body.templateId)
        const thumbnailHash = req.body.sha256;
        const thumbnailData = await TemplateService.updateThumbnail(templateId, userId, req.file.buffer, thumbnailHash)
        res.send(thumbnailData)
    } catch (e) {
        catchError(res, e, 'POST /templateThumbnail')
    }
})

app.get('/sunlight/:from/:to/:dateFrom/:dateTo?', async (req: Request, res: Response) => {
    try {
        const dateFrom: number | undefined = req.params.dateFrom ? Number(req.params.dateFrom) : undefined
        const dateTo: number | undefined = req.params.dateTo ? Number(req.params.dateTo) : undefined
        await GApi.getSunlight(req.params.from, req.params.to, dateFrom, dateTo).then(sunlight => {
            res.send(sunlight)
        })
    } catch (e) {
        console.log(e)
        catchError(res, e, 'GET /sunlight/:from/:to/:date')
    }
})

app.get('/tickets', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)
        const tickets = await TicketService.getAllOpen()
        res.send(tickets)
    } catch (e) {
        catchError(res, e, 'GET /tickets')
    }
})

app.post('/tickets/:id/close', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)
        const id = Number(req.params.id)
        if (isNaN(id)) {
            res.status(400).send('Invalid ticket ID')
            return
        }
        await TicketService.close(id)
        res.send({ status: 'closed', id })
    } catch (e) {
        catchError(res, e, 'POST /tickets/:id/close')
    }
})

app.get('/admin/healthCheck', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)
        const result = await Maintenance.performHealthChecks()
        res.send(result)
    } catch (e) {
        catchError(res, e, 'GET /admin/healthCheck')
    }
})

app.get('/user/profile/:userId', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)

        const userProfile = await Admin.getUserProfile(Number(req.params.userId))
        res.send(userProfile)
    } catch (e) {
        catchError(res, e, 'GET /user/profile')
    }
})

app.get('/usage/active', async (req: Request, res: Response) => {
    try {
        const requester = await Authorization.validateAdmin(req)

        const numberOfDays = req.query.days ? Number(req.query.days) : 1
        const usageDao = new UsageDao()
        const activeUserIds = await usageDao.getActiveUsersLastDays(numberOfDays)
        res.send(activeUserIds)
    } catch (e) {
        catchError(res, e, 'GET /usage/active')
    }
})

app.get('/usage/chi', async (req: Request, res: Response) => {
    try {
        const requester = await Authorization.validateAdmin(req)

        const usageDao = new UsageDao()
        const chiList = await usageDao.getCustomerHapinessIndex()
        res.send(chiList)
    } catch (e) {
        catchError(res, e, 'GET /usage/chi')
    }
})

app.post('/userImage', async (req: Request, res: Response) => {
    try {
        const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const userId = await UserDao.getIdFromHash(payload.user)
        if (!userId) throw new GApiError(401, 'Unauthorized')
        const imageUrl = payload.imageUrl
        const blobUrl = await UserImage.getBlobUrl(userId, imageUrl)
        console.debug('GET /userImage', blobUrl)
        res.send(blobUrl)
    } catch (e) {
        catchError(res, e, 'POST /userImage')
    }
})

app.post('/user/homeAirport', async (req: Request, res: Response) => {
    try {
        const userId = await UserTools.userIdFromRequest(req)
        if (!userId) {
            throw new GApiError(401, 'Unauthorized')
        }
        const payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
        const airportCode = payload.airportCode

        await GApi.setHomeAirport(userId, airportCode)
        res.sendStatus(200)
    } catch (e) {
        catchError(res, e, 'POST /user/homeAirport')
    }
})


if (process.env.__VERCEL_DEV_RUNNING != "1" && process.env.VERCEL != "1" && process.env.NODE_ENV != 'test') {
    app.listen(port, () => console.log("[index] Server ready on port " + port));
}

/**
 * Prints an error in the console and send an error response
 * @param {*} res 
 * @param {*} e 
 * @param {*} context
 */
function catchError(res, e, context): void {
    // console.log( "[index] " + msg + " error " + JSON.stringify(e))
    let status = 500
    let message = e
    if (e instanceof GApiError) {
        status = e.status
        message = e.message
    }
    res.status(status).send(message)
    TicketService.create(3, message + ' ' + context)
}

export default app;
