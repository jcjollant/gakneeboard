
import { describe, expect, it} from '@jest/globals';
import { Template } from '../backend/models/Template.ts'
import { TemplateDao } from '../backend/TemplateDao.ts'
import { jcUserId, jcTestTemplateName, jcTestTemplateData } from './constants.ts';
import { sql } from '@vercel/postgres';
import { newTestUser } from './common.ts';
import { TemplateView } from '../backend/models/TemplateView.ts';
import { UserDao } from '../backend/dao/UserDao.ts';

require('dotenv').config();

describe('Custom Templates', () => {
    describe('countForUser', () => {
        it('Can CountForUser', async () => {
            const result = await sql`SELECT user_id, COUNT(*) FROM sheets GROUP BY user_id`
            for( const row of result.rows) {
                const count = await TemplateDao.countForUser(row.user_id)
                expect(count).toBe(Number(row.count))
            }
        })
        it('Returns 0 for invalid user', async () => {
            const count = await TemplateDao.countForUser(0)
            expect(count).toBe(0)
        })
    })
    
    describe('createOrUpdate', () => {
    })

    describe('delete', () => {
        it('Can delete a newly created record', async () => {
            const template = new Template(0, jcUserId, jcTestTemplateData, jcTestTemplateName, "description", 1, 2)
            const result = await sql `INSERT INTO sheets (name, data, description, pages, version, user_id)
                VALUES (${template.name}, ${JSON.stringify(template.data)}, ${template.description}, ${template.pages}, 1, ${template.userId})
                RETURNING id;`
            expect(result.rows.length).toBe(1)
            template.id = Number(result.rows[0].id)
            
            const output = await TemplateDao.delete(template.id, template.userId)
    
            expect(output).toBe(template.id)
        })

        it.only('Cannot delete with the wrong id', async () => {
            const template = new Template(0, jcUserId, jcTestTemplateData, jcTestTemplateName, "description", 1, 2)
            const result = await sql `INSERT INTO sheets (name, data, description, pages, version, user_id)
                VALUES (${template.name}, ${JSON.stringify(template.data)}, ${template.description}, ${template.pages}, 1, ${template.userId})
                RETURNING id;`
            expect(result.rows.length).toBe(1)
            template.id = Number(result.rows[0].id)
            
            // Invalid user Id, valid template
            const r1 = await TemplateDao.delete(template.id, 0)
            expect(r1).toBe(0)

            // Invalid template id, valid user
            const r2 = await TemplateDao.delete(0, template.userId)
            expect(r2).toBe(0)

            // now do a proper deletion
            const r3 = await TemplateDao.delete(template.id, template.userId)
    
            expect(r3).toBe(template.id)
        })
    })

    describe('getOverviewListForUser', () => {
        it.only('returns the expected list', async () => {
            const user = newTestUser()

            const userDao = new UserDao()
            await userDao.save(user)
            // Create 3 templates for this user
            const tv1 = new TemplateView(0, "name1", jcTestTemplateData, "description1", 1, true, undefined, 2)
            const tv2 = new TemplateView(0, "name2", jcTestTemplateData, "description2", 1, true, undefined, 2)
            const tv3 = new TemplateView(0, "name3", jcTestTemplateData, "description3", 1, false, undefined, 2)
 
            const t1 = await TemplateDao.createOrUpdate(tv1, user.id)
            const t2 = await TemplateDao.createOrUpdate(tv2, user.id)
            const t3 = await TemplateDao.createOrUpdate(tv3, user.id)

            expect(t1.id).toBeGreaterThan(0)
            expect(t2.id).toBeGreaterThan(0)
            expect(t3.id).toBeGreaterThan(0)

            const result = await TemplateDao.getOverviewListForUser(user.id)

            expect(result.length).toBe(3)
            // Test publication, data and version should not be present
            expect(result[0].publish).toBeTruthy()
            expect(result[0].code).toBeDefined()
            expect(result[0].ver).toBe(0)

            expect(result[1].code).toBeDefined()
            expect(result[1].publish).toBeTruthy()
            expect(result[1].ver).toBe(0)

            expect(result[2].code).toBeUndefined()
            expect(result[2].publish).toBeFalsy()
            expect(result[2].ver).toBe(0)

            await Promise.all([
                TemplateDao.delete(t1.id, user.id),
                TemplateDao.delete(t2.id, user.id),
                TemplateDao.delete(t3.id, user.id)])
        })
    })


});

