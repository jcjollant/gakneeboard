const axios = require('axios')

import { describe, expect, it} from '@jest/globals';
import { jcHash, jcHash2, currentAirportModelVersion, currentAsOf, samplePublicationCode, jcTestTemplateData } from '../constants'
import { version } from '../../backend/constants'
import { Maintenance } from '../../backend/Maintenance'
import { newTestUser } from '../common'
import { sql } from '@vercel/postgres'
import { TemplateView } from '../../backend/models/TemplateView';

const apiRootUrl = 'http://localhost:3000/'

describe('index', () => {
    it('root API returns expected values', async () => {
        await Promise.all([
            axios.get( apiRootUrl)
                .then(res => {
                    // console.log(res.data)
                    expect(res.data).toBeDefined();
                    expect(res.data.version).toBe(version)
                    expect(res.data.aced).toBe(currentAsOf)
                    expect(res.data.camv).toBe(currentAirportModelVersion)
                }),
            axios.get( apiRootUrl + '?user=' + jcHash)
                .then(res => {
                    expect(res.data).toBeDefined();
                    expect(res.data.version).toBe(version)
                    expect(res.data.aced).toBe(currentAsOf)
                    expect(res.data.camv).toBe(currentAirportModelVersion)
                    expect(res.data.user).toBeDefined();
                    expect(res.data.user.sha256).toBeDefined();
                    expect(res.data.user.sha256).toBe(jcHash);
                })
            ])
    })
    
    it('Multiple airports query', async () => {
        await axios.get( apiRootUrl + 'airports/rnt-jfk')
            .then(res => {
                // console.log(res.data)
                // console.log( JSON.stringify(res.data))
                expect(res.data).toBeDefined();
                const list = res.data
                expect(list).toHaveLength(2)
            })
    })

    it('Invalid Id', async () => {
        await axios.get( apiRootUrl + 'airport/ABCDE')
            .then( () => {
                expect(true).toBe(false)
            })
            .catch( (error) => {
                // console.log(error)
                expect(error.response).toBeDefined()
                expect(error.response.status).toBeDefined();
                expect(error.response.status).toBe(400);
            })
    })

    it('Maintenance invalid code', async () => {
        await axios.get( apiRootUrl + 'maintenance/invalidcode')
            .then( () => {
                expect(true).toBe(false)
            })
            .catch( (error) => {
                // console.log(error)
                expect(error.response).toBeDefined()
                expect(error.response.status).toBeDefined();
                expect(error.response.status).toBe(404);
            })
    })

    it('Get Maintenance', async () => {
        await axios.get( apiRootUrl + 'maintenance/' + Maintenance.codeTest)
            .then( (res) => {
                expect(res.data).toBeDefined();
                expect(res.data).toBe('OK')
            })
            .catch( (error) => {
                expect(true).toBe(false)
            })
        await axios.get( apiRootUrl + 'maintenance/' + Maintenance.codeLogin)
            .then( (res) => {
                expect(res.data).toBeDefined();
                expect(res.data.sha256).toBe(jcHash2)
            })
            .catch( (error) => {
                expect(true).toBe(false)
            })
    })

    it('Templates and publications', async () => {
        // Create template for use JC
        const templateName = 'Test Template ' + Date.now();
        const newTemplate = new TemplateView(0,templateName, jcTestTemplateData)
        newTemplate.publish = true;
        const user = newTestUser()
        const r = await sql`INSERT INTO users (sha256,version,account_type,data) VALUES(${user.sha256},1,'sim','{}') RETURNING id`
        user.id = r.rows[0].id

        await axios.post(apiRootUrl + 'template/', {user: user.sha256, sheet:newTemplate}, { headers: {'Content-Type':'application/json'} }).then( async (res) => {
            // return code should be 200
            expect(res.status).toBe(200);
            expect(res.data).toBeDefined();
            // console.log(res.data)
            expect(res.data.id).toBeDefined();
            const templateId = res.data.id;
            const publicationCode = res.data.code;

            await Promise.all( [
                axios.get( apiRootUrl + 'template/' + templateId + '?user=' + user.sha256)
                    .then( (res) => {
                        expect(res.data).toBeDefined();
                    })
                .catch( (e) => {
                    console.log(e)
                    expect(true).toBe(false)
                }),
                axios.get( apiRootUrl + 'templates')
                    .then( (res) => {
                        expect(res.data).toBeDefined();
                    })
                .catch( (e) => {
                    console.log(e)
                    expect(true).toBe(false)
                }),
                axios.get( apiRootUrl + 'publication/' + publicationCode)
                    .then( (res) => {
                        expect(res.data).toBeDefined();
                        expect(res.data.id).toBe(templateId);
                    })
                .catch( (e) => {
                    console.log(e)
                    expect(true).toBe(false)
                })
            ])

            await sql`DELETE FROM sheets WHERE id=${templateId}`
        })
        // remove that user
        await sql`DELETE FROM users WHERE id=${user.id} AND sha256=${user.sha256}`
    }, 10000)
})

