import express, { Request, Response } from "express"
import { AirportService } from "../backend/services/AirportService";
import { Authorization } from "../backend/services/Authorization";
import { TicketService } from "../backend/services/TicketService";
import { Maintenance } from '../backend/maintenance/Maintenance'
import { HealthCheck } from "../backend/maintenance/HealthChecks";
import { Admin } from "../backend/Admin"
import { UsageDao } from "../backend/dao/UsageDao";
import { PrintOrderDao } from "../backend/dao/PrintOrderDao";
import { catchError } from "./utils";
import { HousekeepingDao } from "../backend/dao/HousekeepingDao";
import { TemplateDao } from "../backend/TemplateDao";


const router = express.Router();

/**
 * Create a new airport (Admin only)
 */
router.post('/airport', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)

        // payload is in body.request
        const payload = req.body.request
        const airport = await AirportService.createAirport(payload)
        res.status(201).send(airport)
    } catch (e) {
        catchError(res, e, 'POST /airport')
    }
})

router.get('/maintenance/:code', async (req: Request, res: Response) => {
    const maintenance = new Maintenance(req.params.code)
    if (maintenance.isValidCode() === false) {
        res.status(404).send()
        return
    }
    maintenance.perform().then((result) => {
        res.send(result)
    }).catch(e => {
        catchError(res, e, 'GET /maintenance/:code')
    })
})

router.get('/tickets', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)
        const tickets = await TicketService.getAllOpen()
        res.send(tickets)
    } catch (e) {
        catchError(res, e, 'GET /tickets')
    }
})

router.post('/tickets', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)
        const { severity, message } = req.body
        if (!severity || !message) {
            res.status(400).send('Severity and message are required')
            return
        }
        const success = await TicketService.create(Number(severity), message)
        if (success) {
            res.status(201).send({ status: 'created' })
        } else {
            res.status(500).send('Failed to create ticket')
        }
    } catch (e) {
        catchError(res, e, 'POST /tickets')
    }
})

router.post('/tickets/:id/close', async (req: Request, res: Response) => {
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

router.get('/admin/healthCheck', async (req: Request, res: Response) => {
    try {
        await Authorization.validateHealthCheck(req)
        const result = await HealthCheck.perform()
        res.send(result)
    } catch (e) {
        catchError(res, e, 'GET /admin/healthCheck')
    }
})

router.get('/user/profile/:userId', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)

        const userProfile = await Admin.getUserProfile(Number(req.params.userId))
        res.send(userProfile)
    } catch (e) {
        catchError(res, e, 'GET /user/profile')
    }
})

router.get('/usage/active', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)

        const numberOfDays = req.query.days ? Number(req.query.days) : 1
        const usageDao = new UsageDao()
        const activeUserIds = await usageDao.getActiveUsersLastDays(numberOfDays)
        res.send(activeUserIds)
    } catch (e) {
        catchError(res, e, 'GET /usage/active')
    }
})

router.get('/usage/chi', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)

        const usageDao = new UsageDao()
        const chiList = await usageDao.getCustomerHapinessIndex()
        res.send(chiList)
    } catch (e) {
        catchError(res, e, 'GET /usage/chi')
    }
})

router.get('/admin/orders', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)
        const orders = await PrintOrderDao.listOpenOrders();
        res.send(orders);
    } catch (e) {
        catchError(res, e, 'GET /admin/orders')
    }
})

router.post('/admin/orders/:id/ship', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)
        await PrintOrderDao.updateStatus(req.params.id as string, 'SHIPPED' as any);
        res.send({ status: 'SHIPPED' });
    } catch (e) {
        catchError(res, e, 'POST /admin/orders/:id/ship')
    }
})

router.get('/templates/top', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)

        const sortBy = req.query.sortBy as string || 'creation_date'
        const validSorts = ['creation_date', 'version', 'last_save']
        if (!validSorts.includes(sortBy)) {
            res.status(400).send('Invalid sortBy value')
            return
        }

        const dao = new TemplateDao()
        let query: string
        if (sortBy === 'last_save') {
            // Join usage table on the template id stored in usage.data JSON field
            query = `
                SELECT s.id, s.name, s.user_id, s.version, s.pages, s.creation_date,
                       MAX(u.create_time) AS last_save
                FROM sheets AS s
                LEFT JOIN usage AS u ON (u.data::jsonb->>'id')::int = s.id AND u.usage_type = 'save'
                GROUP BY s.id, s.name, s.user_id, s.version, s.pages, s.creation_date
                ORDER BY last_save DESC NULLS LAST
                LIMIT 100
            `
        } else if (sortBy === 'version') {
            query = `
                SELECT id, name, user_id, version, pages, creation_date, NULL AS last_save
                FROM sheets
                ORDER BY version DESC
                LIMIT 100
            `
        } else {
            // creation_date (default)
            query = `
                SELECT id, name, user_id, version, pages, creation_date, NULL AS last_save
                FROM sheets
                ORDER BY creation_date DESC
                LIMIT 100
            `
        }

        const result = await dao['db'].query(query)
        res.send(result.rows)
    } catch (e) {
        catchError(res, e, 'GET /templates/top')
    }
})

router.get('/admin/housekeeping', async (req: Request, res: Response) => {
    try {
        await Authorization.validateAdmin(req)
        const dao = new HousekeepingDao()
        const history = await dao.getAll()
        res.send(history)
    } catch (e) {
        catchError(res, e, 'GET /housekeeping')
    }
})

export default router;
