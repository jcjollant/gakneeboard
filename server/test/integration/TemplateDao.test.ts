
import { describe, expect, it, afterAll, xdescribe } from '@jest/globals';
import { TemplateDao } from '../../backend/TemplateDao'
import { jcUserId, jcTestTemplateName, jcTestTemplateData } from '../constants';
import { sql } from '@vercel/postgres';
import { newTestUser } from '../common';
import { TemplateView } from '../../backend/models/TemplateView';
import { UserDao } from '../../backend/dao/UserDao';
import { PublicationDao } from '../../backend/PublicationDao';
import { Template } from '../../backend/models/Template';

import * as dotenv from 'dotenv'
import { TemplateFormat } from '../../backend/models/TemplateFormat';
dotenv.config()

xdescribe('Custom Templates', () => {
    describe('countForUser', () => {
        it('Can CountForUser', async () => {
            const result = await sql`SELECT user_id, COUNT(*) FROM sheets GROUP BY user_id`
            for (const row of result.rows) {
                const count = await TemplateDao.countForUserStatic(row.user_id)
                expect(count).toBe(Number(row.count))
            }
        })
        it('Returns 0 for invalid user', async () => {
            const count = await TemplateDao.countForUserStatic(0)
            expect(count).toBe(0)
        })
    })

    describe('createOrUpdate', () => {
        it('fails on invalid template or user Id', async () => {
            const tv1 = new TemplateView(-1, "name", jcTestTemplateData, TemplateFormat.Kneeboard, "description", 1)

            // tv has invalid template, jcUserId is valid
            expect(TemplateDao.createOrUpdateViewStatic(tv1, jcUserId)).rejects.toThrow(new Error('Invalid template or user id'))

            const result = await sql`SELECT * FROM sheets LIMIT 1`
            expect(result.rows.length).toBe(1)
            const row = result.rows[0]
            const tv2 = new TemplateView(row.id, row.name, row.data, TemplateFormat.Kneeboard, row.description, 2)

            // tv2 has valid template id, 0 is invalid for userId
            expect(TemplateDao.createOrUpdateViewStatic(tv2, 0)).rejects.toThrow(new Error('Invalid template or user id'))
        })

        it('creates a new template', async () => {
            const tv1 = new TemplateView(0, "name1", jcTestTemplateData, TemplateFormat.Kneeboard, "description1", 1, true, undefined, 2)

            const t1 = await TemplateDao.createOrUpdateViewStatic(tv1, jcUserId)
            expect(t1.id).toBeGreaterThan(0)
            expect(t1.pages).toBe(2)

            const r = await TemplateDao.deleteStatic(t1.id, jcUserId)
            expect(r).toBe(t1.id)
        })

        it('updates an existing template', async () => {
            let version = 1
            const name1 = "name1"
            const name2 = "name2"
            const desc1 = "description1"
            const desc2 = "description2"
            const data1 = jcTestTemplateData
            const data2 = {}
            const pages1 = 2
            const pages2 = 0
            const tv1 = new TemplateView(0, name1, data1, TemplateFormat.Kneeboard, desc1, version, true, undefined, pages1)

            const t1 = await TemplateDao.createOrUpdateViewStatic(tv1, jcUserId)
            expect(t1.id).toBeGreaterThan(0)
            // memorize template id
            tv1.id = t1.id
            tv1.ver = t1.ver

            // version should increase
            expect(t1.ver).toBe(++version)
            expect(t1.name).toBe(name1)
            expect(t1.desc).toBe(desc1)
            expect(t1.data).toEqual(data1)
            expect(t1.pages).toBe(pages1)

            tv1.name = name2;
            tv1.desc = desc2
            tv1.data = data2
            tv1.pages = pages2
            const t2 = await TemplateDao.createOrUpdateViewStatic(tv1, jcUserId)
            tv1.id = t2.id
            tv1.ver = t2.ver

            // Id should stay the same
            expect(t2.id).toBe(t1.id)
            // Version should increase
            expect(t2.ver).toBe(++version)
            // Name and description should be updated
            expect(t2.name).toBe(name2)
            expect(t2.desc).toBe(desc2)
            expect(t2.data).toEqual(data2)
            expect(t2.pages).toBe(pages2)

            const r = await TemplateDao.deleteStatic(t1.id, jcUserId)
            expect(r).toBe(t1.id)
        })
    })

    describe('delete', () => {
        it('Can delete a newly created record', async () => {
            const template = new Template(0, jcUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, "description", 1, 2)
            const result = await sql`INSERT INTO sheets (name, data, description, pages, version, user_id)
                VALUES (${template.name}, ${JSON.stringify(template.data)}, ${template.description}, ${template.pages}, 1, ${template.userId})
                RETURNING id;`
            expect(result.rows.length).toBe(1)
            template.id = Number(result.rows[0].id)

            const output = await TemplateDao.deleteStatic(template.id, template.userId)

            expect(output).toBe(template.id)
        })

        it('Cannot delete with the wrong id', async () => {
            const template = new Template(0, jcUserId, jcTestTemplateData, TemplateFormat.Kneeboard, jcTestTemplateName, "description", 1, 2)
            const result = await sql`INSERT INTO sheets (name, data, description, pages, version, user_id)
                VALUES (${template.name}, ${JSON.stringify(template.data)}, ${template.description}, ${template.pages}, 1, ${template.userId})
                RETURNING id;`
            expect(result.rows.length).toBe(1)
            template.id = Number(result.rows[0].id)

            // Invalid user Id, valid template
            const r1 = await TemplateDao.deleteStatic(template.id, 0)
            expect(r1).toBe(0)

            // Invalid template id, valid user
            const r2 = await TemplateDao.deleteStatic(0, template.userId)
            expect(r2).toBe(0)

            // now do a proper deletion
            const r3 = await TemplateDao.deleteStatic(template.id, template.userId)

            expect(r3).toBe(template.id)
        })
    })

    describe('getOverviewListForUser', () => {
        it('returns the expected list', async () => {
            const user = newTestUser()

            const userDao = new UserDao()
            await userDao.save(user)
            // Create 3 templates for this user with different publication statuses
            const tv1 = new TemplateView(0, "name1", jcTestTemplateData, TemplateFormat.Kneeboard, "description1", 1, true, undefined, 2)
            const tv2 = new TemplateView(0, "name2", jcTestTemplateData, TemplateFormat.Kneeboard, "description2", 1, true, undefined, 2)
            const tv3 = new TemplateView(0, "name3", jcTestTemplateData, TemplateFormat.Kneeboard, "description3", 1, false, undefined, 2)

            const t1 = await TemplateDao.createOrUpdateViewStatic(tv1, user.id)
            const pub1 = await PublicationDao.publish(t1.id)
            expect(pub1).toBeDefined()
            const t2 = await TemplateDao.createOrUpdateViewStatic(tv2, user.id)
            const pub2 = await PublicationDao.publish(t2.id)
            expect(pub2).toBeDefined()
            const t3 = await TemplateDao.createOrUpdateViewStatic(tv3, user.id)

            expect(t1.id).toBeGreaterThan(0)
            // console.log(t1.id)
            expect(t2.id).toBeGreaterThan(0)
            expect(t3.id).toBeGreaterThan(0)

            const result = await TemplateDao.getOverviewListForUser(user.id)

            expect(result.length).toBe(3)
            // Test publication, data and version should not be present
            expect(result[0].publish).toBeTruthy()
            expect(result[0].code).toBeDefined()
            expect(result[0].ver).toBe(1)

            expect(result[1].code).toBeDefined()
            expect(result[1].publish).toBeTruthy()
            expect(result[1].ver).toBe(1)

            expect(result[2].code).toBeNull()
            expect(result[2].publish).toBeFalsy()
            expect(result[2].ver).toBe(1)

            await Promise.all([
                TemplateDao.deleteStatic(t1.id, user.id),
                TemplateDao.deleteStatic(t2.id, user.id),
                TemplateDao.deleteStatic(t3.id, user.id)])


        })
    })

    describe('parseRow', () => {
        const templateDao = new TemplateDao()
        it('parses a valid row', () => {
            const row = {
                id: 1,
                name: 'name',
                data: jcTestTemplateData,
                description: 'description',
                creation_date: new Date(),
                pages: 2,
                version: 1,
                user_id: 1,
                thumbnail: 'someUrl',
                thumbhash: 'someHash',
            }
            const template = templateDao.parseRow(row)
            expect(template.id).toBe(row.id)
            expect(template.name).toBe(row.name)
            expect(template.data).toEqual(row.data)
            expect(template.description).toBe(row.description)
            expect(template.creationDate).toEqual(row.creation_date)
            expect(template.pages).toBe(row.pages)
            expect(template.version).toBe(row.version)
            expect(template.userId).toBe(row.user_id)
            expect(template.thumbnail).toBe(row.thumbnail)
            expect(template.thumbhash).toBe(row.thumbhash)
        })
    })
    afterAll(async () => {
        await sql.end()
    })
});

