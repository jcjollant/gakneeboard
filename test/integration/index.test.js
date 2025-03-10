const axios = require('axios')

import { jcHash, jcHash2, currentAirportModelVersion, currentAsOf, samplePublicationCode, jcTestTemplateData } from '../constants.ts'
import { version } from '../../backend/constants.js'
import { Maintenance } from '../../backend/Maintenance.ts'
import { Template } from '../../backend/models/Template.ts'

const apiRootUrl = 'http://localhost:3000/'

describe('index', () => {
    it('root', async () => {
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

    it('Get Custom Airport', async () => {
        await axios.get( apiRootUrl + 'airport/TEST?user=' + jcHash)
            .then( (res) => {
                expect(res.data).toBeDefined();
                expect(res.data.code).toBe('TEST')
            })
            .catch( (error) => {
                console.log(error)
                expect(true).toBe(false)
                // expect(error.response.status).toBe(400);
            })
    })

    it('Templates and publications', async () => {
        // Create template for use JC
        const templateName = 'Test Template ' + Date.now();
        const newTemplate = new Template(0,templateName, jcTestTemplateData)
        newTemplate.publish = true;
        await axios.post(apiRootUrl + 'template/', {user: jcHash, sheet:newTemplate}, { headers: {'Content-Type':'application/json'} }).then( async (res) => {
            // return code should be 200
            expect(res.status).toBe(200);
            expect(res.data).toBeDefined();
            // console.log(res.data)
            expect(res.data.id).toBeDefined();
            const templateId = res.data.id;
            const publicationCode = res.data.code;

            await Promise.all( [
                axios.get( apiRootUrl + 'template/' + templateId + '?user=' + jcHash)
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


        })
    }, 10000)
})

