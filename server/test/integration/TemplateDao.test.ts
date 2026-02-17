import { describe, expect, it, afterAll, xdescribe } from '@jest/globals';
import { TemplateDao } from '../../backend/TemplateDao'
import { jcUserId, jcTestTemplateName, jcTestTemplateData } from '../constants';
import { sql } from '@vercel/postgres';
import { newTestUser } from '../common';
import { TemplateKneeboardView } from '../../backend/models/TemplateKneeboardView';
import { UserDao } from '../../backend/dao/UserDao';
import { PublicationDao } from '../../backend/PublicationDao';
import { Template } from '../../backend/models/Template';

import * as dotenv from 'dotenv'
import { TemplateFormat } from '@gak/shared';
dotenv.config()
// Force test DB
process.env.POSTGRES_URL = process.env.POSTGRES_TEST_URL

describe('Custom Templates', () => {
    describe('countForUser', () => {
        it('Can CountForUser', async () => {
            const result = await sql`SELECT user_id, COUNT(*) FROM sheets WHERE user_id IS NOT NULL GROUP BY user_id`
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
        let user: any
        let otherUser: any
        const templateDao = TemplateDao.getInstance()

        it('creates a new template', async () => {
            const tv1 = new TemplateKneeboardView(0, "name1", jcTestTemplateData, TemplateFormat.Kneeboard, "description1", 1, true, undefined, 2)
            const t1 = await templateDao.createOrUpdate(tv1, jcUserId)
            expect(t1.id).toBeGreaterThan(0)
            expect(t1.pages).toBe(2)
            // TemplateDao increments version on createOrUpdate. Input 1 -> Returned 2. (DB is 1)
            expect(t1.ver).toBe(2)

            // Cleanup
            await TemplateDao.deleteStatic(t1.id, jcUserId)
        })

        it('updates an existing template', async () => {
            // Create initial template. Ret: 2, DB: 1
            const tv1 = new TemplateKneeboardView(0, "name1", jcTestTemplateData, TemplateFormat.Kneeboard, "description1", 1, true, undefined, 2)
            const t1 = await templateDao.createOrUpdate(tv1, jcUserId)

            // Modify it (t1.ver is 2)
            t1.name = "name2"
            t1.desc = "description2"
            t1.pages = 3

            // Update. Ret: 3, DB: 3
            const t2 = await templateDao.createOrUpdate(t1, jcUserId)

            expect(t2.id).toBe(t1.id)
            expect(t2.ver).toBe(3)
            expect(t2.name).toBe("name2")
            expect(t2.desc).toBe("description2")
            expect(t2.pages).toBe(3)

            // Verify persistence
            const saved = await templateDao.readById(t1.id, jcUserId)
            expect(saved?.name).toBe("name2")
            expect(saved?.version).toBe(3)

            // Cleanup
            await TemplateDao.deleteStatic(t1.id, jcUserId)
        })

        it('fails to update a non-existent template', async () => {
            const tv = new TemplateKneeboardView(999999, "name", jcTestTemplateData, TemplateFormat.Kneeboard, "description", 1, true, undefined, 2)
            // Fails with "Non Admin user can't update system template" because 'Not Found' is treated as 'System Template' for non-admins
            await expect(templateDao.createOrUpdate(tv, jcUserId)).rejects.toThrow("Non Admin user can't update system template")
        })

        it('fails to update another user\'s template', async () => {
            // Setup another user
            const otherUser = newTestUser()
            await new UserDao().save(otherUser)

            // Create template for main user
            const tv = new TemplateKneeboardView(0, "owned", jcTestTemplateData, TemplateFormat.Kneeboard, "desc", 1, true, undefined, 2)
            const t1 = await templateDao.createOrUpdate(tv, jcUserId)

            // Try to update with other user
            // Fails with "Non Admin user can't update system template" because 'Not Found for user' is treated as 'System Template'
            await expect(templateDao.createOrUpdate(t1, otherUser.id)).rejects.toThrow("Non Admin user can't update system template")

            // Cleanup
            await TemplateDao.deleteStatic(t1.id, jcUserId)
        })

        describe('System Templates', () => {
            it('allows admin to update system template', async () => {
                // Insert system template manually
                const result = await sql`INSERT INTO sheets (name, data, format, description, pages, version, user_id) VALUES ('System Tpl', ${JSON.stringify(jcTestTemplateData)}, 'kneeboard', 'desc', 1, 1, NULL) RETURNING id`
                const sysId = result.rows[0].id

                const tv = new TemplateKneeboardView(sysId, "System Tpl Updated", jcTestTemplateData, TemplateFormat.Kneeboard, "desc", 1, true, undefined, 1)

                // Update as admin (isAdmin=true)
                const updated = await templateDao.createOrUpdate(tv, jcUserId, true)
                expect(updated.name).toBe("System Tpl Updated")
                expect(updated.ver).toBe(2)

                // Verify persistence
                const saved = await templateDao.readById(sysId, jcUserId, true) // admin read
                expect(saved?.name).toBe("System Tpl Updated")

                // Cleanup
                await sql`DELETE FROM sheets WHERE id=${sysId}`
            })

            it('prevents non-admin from updating system template', async () => {
                const result = await sql`INSERT INTO sheets (name, data, format, description, pages, version, user_id) VALUES ('System Tpl 2', ${JSON.stringify(jcTestTemplateData)}, 'kneeboard', 'desc', 1, 1, NULL) RETURNING id`
                const sysId = result.rows[0].id

                const tv = new TemplateKneeboardView(sysId, "System Tpl 2 Updated", jcTestTemplateData, TemplateFormat.Kneeboard, "desc", 1, true, undefined, 1)

                // Update as non-admin
                await expect(templateDao.createOrUpdate(tv, jcUserId, false)).rejects.toThrow("Non Admin user can't update system template")

                // Cleanup
                await sql`DELETE FROM sheets WHERE id=${sysId}`
            })
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
            const tv1 = new TemplateKneeboardView(0, "name1", jcTestTemplateData, TemplateFormat.Kneeboard, "description1", 1, true, undefined, 2)
            const tv2 = new TemplateKneeboardView(0, "name2", jcTestTemplateData, TemplateFormat.Kneeboard, "description2", 1, true, undefined, 2)
            const tv3 = new TemplateKneeboardView(0, "name3", jcTestTemplateData, TemplateFormat.Kneeboard, "description3", 1, false, undefined, 2)

            const templateDao = TemplateDao.getInstance()
            const t1 = await templateDao.createOrUpdate(tv1, user.id)
            const pub1 = await PublicationDao.publish(t1.id)
            expect(pub1).toBeDefined()
            const t2 = await templateDao.createOrUpdate(tv2, user.id)
            const pub2 = await PublicationDao.publish(t2.id)
            expect(pub2).toBeDefined()
            const t3 = await templateDao.createOrUpdate(tv3, user.id)

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
