
import dotenv from 'dotenv'
dotenv.config()

process.env.POSTGRES_URL = process.env.POSTGRES_PROD_URL

import { UserDao } from '../backend/dao/UserDao';
import { Template } from '../backend/models/Template';
import { TemplateDao } from '../backend/TemplateDao';

class UserUsage {
    id: number = 0
    maxTemplates: number = 0
    templateCount: number = 0
    maxPages: number = 0
    pageCount: number = 0
    plan: string = ''
    constructor(id: number, maxTemplates: number, maxPages: number, plan: string) {
        this.id = id
        this.maxTemplates = maxTemplates
        this.maxPages = maxPages
        this.templateCount = 0
        this.pageCount = 0
        this.plan = plan
    }
}

// declare and execute
async function doIt() {
    const userDao = new UserDao()
    const users = await userDao.getAll()
    users.sort((a, b) => a.maxTemplates - b.maxTemplates)
    console.log(`Found ${users.length} users`)
    const templateDao = new TemplateDao()
    for (const user of users) {
        const uu = new UserUsage(user.id, user.maxTemplates, user.maxPages, user.planId)
        const templates: Template[] = await templateDao.getForUser(user.id)
        uu.templateCount = templates.length
        // count pages
        for (const template of templates) {
            uu.pageCount += JSON.parse(template.data).length
        }
        // console.log( JSON.stringify(user))
        console.log(`${user.id} ${uu.templateCount} ${uu.maxTemplates} ${uu.pageCount} ${uu.maxPages} ${uu.plan}`)
    }
}

doIt().then(() => {
    console.log('done')
})
