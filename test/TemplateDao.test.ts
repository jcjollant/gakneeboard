
import { describe, expect, it, test} from '@jest/globals';
import { Template } from '../backend/models/Template.ts'
import { TemplateDao } from '../backend/TemplateDao.ts'
import { jcUserId, jcTestTemplateName, jcTestTemplateData, jcMaxTemplates, jcHash2 } from './constants.ts';
import { UserDao } from '../backend/dao/UserDao.ts';
import { sql } from '@vercel/postgres';
import { count } from 'console';
import { TemplateView } from '../backend/models/TemplateView.ts';

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

    })

    describe('getOverviewListForUser', () => {

    })


});

