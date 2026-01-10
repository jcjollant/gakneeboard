import { AdipService } from "./services/AdipService";
import { AdipDao } from "./adip/AdipDao";
import { AirportDao } from "./AirportDao";
import { Email, EmailType } from "./Email";
import { FeedbackDao } from "./FeedbackDao"
import { PageType } from './TemplateTools'
import { PublicationDao } from './PublicationDao'
import { UsageDao, UsageType } from "./dao/UsageDao";
import { TemplateDao } from "./TemplateDao";
import { TemplateView } from "./models/TemplateView";
import { UserDao } from "./dao/UserDao"
import { UserTemplateData } from "./models/UserTemplateData";
import { UserTools } from './UserTools'
import { UserUsage } from "./models/UserUsage";
import { Business } from "./business/Business";
import { SubscriptionDao } from "./dao/SubscriptionDao";
import { SkyvectorDao } from "./skyvector/SkyvectorDao";

export class Metric {
    name: string;
    value: number;

    constructor(metricName: string, value: number = 0) {
        this.name = metricName;
        this.value = value;
    }

    public addOne() {
        this.value++;
    }
}

export enum MetricKey {
    adip = 'adip',
    adip28 = 'adip-28d',
    skyvector = 'skyvector',
    skyvector28 = 'skyvector-28d',
    airportsTotal = 'airports-total',
    airportsValid = 'airports-valid',
    airportsCurrent = 'airports-current',
    customers = 'cust-assigned',
    customersActive = 'cust-active',
    customersChurn30d = 'cust-churn-30d',
    customersNew30d = 'cust-new-30d',
    exports = 'exports',
    export7 = 'exports-7d',
    export28 = 'exports-28d',
    feedbacks = 'feedbacks',
    onboard28 = 'onboard-28d',
    pageApproach = 'approachPageCount',
    pageDiagram = 'diagramPageCount',
    pageChecklist = 'checklistPageCount',
    pageCover = 'coverPageCount',
    pageNavlog = 'navlogPageCount',
    pageNotes = 'notesPageCount',
    pageSelection = 'selectionPageCount',
    pageStrip = 'stripPageCount',
    pageTiles = 'tilePageCount',
    pagesTotal = 'totalPageCount',
    prints = 'prints',
    print7 = 'prints-7d',
    print28 = 'prints-28d',
    printUser7 = 'printUsers-7d',
    printUser28 = 'printUsers-28d',
    revenueARPA = 'revenue-arpa',
    save7 = 'save-7d',
    save28 = 'save-28d',
    sessions = 'sessions',
    sessions7 = 'sessions-7d',
    sessions14 = 'sessions-14d',
    sessions28 = 'sessions-28d',
    templates = 'templates',
    templatesStale = 'staleTemplateCount',
    tileAirport = 'airportTileCount',
    tileAtis = 'atisTileCount',
    tileChecklist = 'checklistTileCount',
    tileClearance = 'clearanceTileCount',
    tileFuel = 'fuelTileCount',
    tileNavlog = 'navlogTileCount',
    tileNotes = 'notesTileCount',
    tileRadios = 'radiosTileCount',
    tileSunlight = 'sunlightTileCount',
    tilesTotal = 'totalTileCount',
    users = 'users',
    usersGoogle = 'usersGoogle',
    usersApple = 'usersApple',
    usersFacebook = 'usersFacebook',
    userCat0 = 'cat-0',
    userCat1 = 'cat-1-4',
    userCat5 = 'cat-5-19',
    userCat20 = 'cat-20',
}

export class Metrics {

    static async adip(): Promise<Metric[]> {
        const adipCount = await AdipDao.countSince(28)
        return [new Metric(MetricKey.adip28, adipCount)]
    }

    static async skyvector(): Promise<Metric[]> {
        const count = await SkyvectorDao.countSince(28)
        return [new Metric(MetricKey.skyvector28, count)]
    }

    static async airports(): Promise<Metric[]> {
        const all = await AirportDao.count()
        const output: Metric[] = []
        output.push(new Metric(MetricKey.airportsTotal, await AirportDao.count()))
        output.push(new Metric(MetricKey.airportsValid, await AirportDao.countValid()))
        output.push(new Metric(MetricKey.airportsCurrent, (await AirportDao.readCurrent(AdipService.currentEffectiveDate())).length))
        return output
    }

    static async usage(): Promise<Metric[]> {
        const usageMetrics: Metric[] = []
        const usageDao = new UsageDao();
        usageMetrics.push(new Metric(MetricKey.export7, await usageDao.countTypeByUserSince(UsageType.Export, 7)))
        usageMetrics.push(new Metric(MetricKey.export28, await usageDao.countTypeByUserSince(UsageType.Export, 28)))
        usageMetrics.push(new Metric(MetricKey.print7, await usageDao.countTypeSince(UsageType.Print, 7)))
        usageMetrics.push(new Metric(MetricKey.print28, await usageDao.countTypeSince(UsageType.Print, 28)))
        usageMetrics.push(new Metric(MetricKey.printUser7, await usageDao.countTypeByUserSince(UsageType.Print, 7)))
        usageMetrics.push(new Metric(MetricKey.printUser28, await usageDao.countTypeByUserSince(UsageType.Print, 28)))
        usageMetrics.push(new Metric(MetricKey.save7, await usageDao.countTypeSince(UsageType.Save, 7)))
        usageMetrics.push(new Metric(MetricKey.save28, await usageDao.countTypeSince(UsageType.Save, 28)))
        usageMetrics.push(new Metric(MetricKey.sessions7, await usageDao.countTypeByUserSince(UsageType.Session, 7)))
        usageMetrics.push(new Metric(MetricKey.sessions28, await usageDao.countTypeByUserSince(UsageType.Session, 28)))

        return usageMetrics
    }

    static usageTypeToKey(type: UsageType): string {
        switch (type) {
            case UsageType.Export: return MetricKey.exports
            case UsageType.Print: return MetricKey.prints
            case UsageType.Session: return MetricKey.sessions
        }
        // return '?'
    }

    static async users(): Promise<Metric[]> {
        const userDao = new UserDao();

        const allMetrics: Metric[] = []

        const allUsers = await userDao.getAll()
        allMetrics.push(new Metric(MetricKey.users, allUsers.length))
        // split by source
        const googleUsers = new Metric(MetricKey.usersGoogle)
        allMetrics.push(googleUsers)
        const appleUsers = new Metric(MetricKey.usersApple)
        allMetrics.push(appleUsers)
        const facebookUsers = new Metric(MetricKey.usersFacebook)
        allMetrics.push(facebookUsers)
        const onboarded28 = new Metric(MetricKey.onboard28)
        allMetrics.push(onboarded28)
        const customers = new Metric(MetricKey.customers)
        allMetrics.push(customers)
        const activeCustomers = new Metric(MetricKey.customersActive)
        allMetrics.push(activeCustomers)
        let monthlyRevenue = 0

        const now = Date.now()

        for (const user of allUsers) {
            if (user.source == UserTools.google) {
                googleUsers.addOne()
            } else if (user.source == UserTools.apple) {
                appleUsers.addOne()
            } else if (user.source == UserTools.facebook) {
                facebookUsers.addOne()
            } else {
                // console.log('Unknown source for user ', user.id)
            }

            if (user.createDate) {
                // console.log('dates', now, user.createDate.getTime())
                const dateDiff = (now - user.createDate.getTime()) / (1000 * 60 * 60 * 24)
                // console.log('dateDiff', dateDiff)
                if (dateDiff <= 28) onboarded28.addOne()
            }

            if (user.customerId) {
                customers.addOne()
            }
            if (Business.isActiveCustomer(user)) {
                monthlyRevenue += Business.monthlyRevenue(user)
                activeCustomers.addOne()
            }
        }

        // compute the average monthly revenue
        allMetrics.push(new Metric(MetricKey.revenueARPA, monthlyRevenue / activeCustomers.value))

        return allMetrics
    }

    static async feedbacks(): Promise<Metric[]> {
        const feedbackCount: number = await FeedbackDao.count()
        return [new Metric(MetricKey.feedbacks, feedbackCount)]
    }

    static async templates(): Promise<Metric[]> {
        const templateDao = new TemplateDao();
        const templateCount: number = await templateDao.count()
        return [new Metric(MetricKey.templates, templateCount)]
    }

    static async business(): Promise<Metric[]> {
        const subscriptionDao = new SubscriptionDao();
        const businessMetrics: Metric[] = []

        const newCustomers = await subscriptionDao.getNewCustomersLast30Days()
        businessMetrics.push(new Metric(MetricKey.customersNew30d, newCustomers))

        const churnCount = await subscriptionDao.getChurnLastDays(30)
        businessMetrics.push(new Metric(MetricKey.customersChurn30d, churnCount))

        return businessMetrics
    }

    static async templateDetails(): Promise<Metric[]> {
        const templates: TemplateView[] = await TemplateDao.getAllTemplateData()

        // build a list of all metrics
        const metricsKeys: MetricKey[] = [MetricKey.pagesTotal, MetricKey.pageTiles, MetricKey.pageChecklist, MetricKey.pageStrip, MetricKey.pageCover, MetricKey.pageSelection, MetricKey.pageNavlog, MetricKey.pageNotes, MetricKey.pageApproach, MetricKey.pageDiagram,
        MetricKey.tilesTotal, MetricKey.tileAirport, MetricKey.tileAtis, MetricKey.tileChecklist, MetricKey.tileClearance, MetricKey.tileFuel, MetricKey.tileNavlog, MetricKey.tileNotes, MetricKey.tileRadios, MetricKey.tileSunlight, MetricKey.templatesStale]
        // populate the dictionary with metrics
        const ml: { [key: string]: Metric } = {}
        for (const key of metricsKeys) ml[key] = new Metric(key)

        for (let template of templates) {
            for (let page of template.data) {
                if (page.type == PageType.tiles) {
                    ml[MetricKey.pageTiles].addOne()
                    try {
                        for (let tile of page.data) {
                            ml[MetricKey.tilesTotal].addOne()
                            if (tile.name == 'airport') {
                                ml[MetricKey.tileAirport].addOne()
                            } else if (tile.name == 'atis') {
                                ml[MetricKey.tileAtis].addOne()
                            } else if (tile.name == 'checklist') {
                                ml[MetricKey.tileChecklist].addOne()
                            } else if (tile.name == 'clearance') {
                                ml[MetricKey.tileClearance].addOne()
                            } else if (tile.name == 'fuel') {
                                ml[MetricKey.tileFuel].addOne()
                            } else if (tile.name == 'navlog') {
                                ml[MetricKey.tileNavlog].addOne()
                            } else if (tile.name == 'notes') {
                                ml[MetricKey.tileNotes].addOne()
                            } else if (tile.name == 'radios') {
                                ml[MetricKey.tileRadios].addOne()
                            } else if (tile.name == 'sunlight') {
                                ml[MetricKey.tileSunlight].addOne()
                            }
                        }
                    } catch (err) {
                        console.log('[Metrics.templateDetails] could not list tiles', template.id, page.name, page.data)
                    }
                } else if (page.type == PageType.checklist) {
                    ml[MetricKey.pageChecklist].addOne()
                } else if (page.type == PageType.strips) {
                    ml[MetricKey.pageStrip].addOne()
                } else if (page.type == PageType.cover) {
                    ml[MetricKey.pageCover].addOne()
                } else if (page.type == PageType.selection) {
                    ml[MetricKey.pageSelection].addOne()
                } else if (page.type == PageType.navLog) {
                    ml[MetricKey.pageNavlog].addOne()
                } else if (page.type == PageType.notes) {
                    ml[MetricKey.pageNotes].addOne()
                } else if (page.type == PageType.approach) {
                    ml[MetricKey.pageApproach].addOne()
                } else if (page.type == PageType.diagram) {
                    ml[MetricKey.pageDiagram].addOne()
                } else {
                    continue
                }
                ml[MetricKey.pagesTotal].addOne()
            }
            // we assume that 12 data means stale
            if (template.data.length == 12) {
                ml[MetricKey.templatesStale].addOne()
            }
        }
        return metricsKeys.map((mk: string) => ml[mk])
    }

    static async publicationsCheck(): Promise<Metric[]> {
        const publicationCount = await PublicationDao.count()
        return [new Metric('publications', publicationCount)]
    }

    /**
     * Sends an email with the outcome of all checks
     * This methods requires a password that seems to expire ona regular bas
     * @param data 
     * @returns 
     */
    static async sendMail(data: any): Promise<boolean> {
        const message = 'Here are ' + new Date().toDateString() + ' metrics\n\n' + data;
        return Email.send(message, EmailType.Metric)
    }

    public static async pagePerUser(): Promise<Map<number, UserUsage>> {
        const result: UserTemplateData[] = await TemplateDao.getTemplateDataByUser()
        // console.log( 'templates count', result.length)
        return result.reduce((acc, utd) => {
            // console.log( entry.id, entry.pages)
            // console.log( utd.userId, templateData.length)
            const usage = acc.get(utd.userId) || new UserUsage()
            usage.addTemplate(utd.pages)
            acc.set(utd.userId, usage)
            // console.log(entry.id, value)
            return acc
        }, new Map<number, UserUsage>())
    }

    static async usersPerAccountCategory(): Promise<Metric[]> {
        const output = new Promise<Metric[]>((resolve, reject) => {
            Metrics.pagePerUser().then(async usage => {
                const cat0 = new Metric(MetricKey.userCat0)
                const cat1 = new Metric(MetricKey.userCat1)
                const cat5 = new Metric(MetricKey.userCat5)
                const cat20 = new Metric(MetricKey.userCat20)
                // reduce UserUsage map to individual metric
                usage.forEach((value: UserUsage, key: number) => {
                    if (value.pages == 0) {
                        cat0.addOne()
                    } else if (value.pages < 5) {
                        cat1.addOne()
                    } else if (value.pages < 20) {
                        cat5.addOne()
                    } else {
                        cat20.addOne()
                    }
                })
                if (cat0.value == 0) {
                    const userCount = await new UserDao().count();
                    cat0.value = userCount - cat1.value - cat5.value - cat20.value;
                }
                resolve([cat0, cat1, cat5, cat20])
            })
        })
        return output
    }

    public static async perform(): Promise<Metric[]> {
        // return everything into one array
        const output = (await Promise.all([
            Metrics.users(),
            Metrics.feedbacks(),
            Metrics.templateDetails(),
            Metrics.usage(),
            Metrics.business(),
            Metrics.usersPerAccountCategory(),
            Metrics.publicationsCheck(),
            Metrics.templates(),
            Metrics.airports(),
            Metrics.adip(),
            Metrics.skyvector()
        ])).reduce((all, one) => {
            all.push(...one)
            return all
        }, [])
        return output
    }

    public static async topAirports() {
        const templates: TemplateView[] = await TemplateDao.getAllTemplateData()

        let map = {}

        console.log('tempates', templates.length)
        for (let template of templates) {
            for (let page of template.data) {
                if (page.type == PageType.tiles) {
                    for (let tile of page.data) {
                        if (tile.name == 'airport') {
                            console.log('airport tile', tile.data.code)
                            if (!tile.data.code) continue
                            const code = tile.data.code.toUpperCase()
                            const count = map[code] ?? 0
                            map[code] = count + 1
                        }
                    }
                }
            }
        }

        for (let key in map) {
            console.log(key, map[key])
        }
    }
}
