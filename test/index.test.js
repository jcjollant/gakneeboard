const axios = require('axios')

import { jcHash, jcHash2, currentAirportModelVersion, currentAsOf, currentVersion} from './constants.ts'

const apiRootUrl = 'http://localhost:3000/'

describe('index', () => {
    test('Multiple airports query', async () => {
        await axios.get( apiRootUrl + 'airports/rnt-jfk')
            .then(res => {
                // console.log(res.data)
                // console.log( JSON.stringify(res.data))
                expect(res.data).toBeDefined();
                const list = res.data
                expect(list).toHaveLength(2)
            })
    })

    test('API Version', async () => {
        await axios.get( apiRootUrl)
            .then(res => {
                // console.log(res.data)
                expect(res.data).toBeDefined();
                expect(res.data.version).toBe(currentVersion)
                expect(res.data.aced).toBe(currentAsOf)
                expect(res.data.camv).toBe(currentAirportModelVersion)
            })
    })

    test('Invalid Id', async () => {
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

    test('Get Maintenance', async () => {
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
        await axios.get( apiRootUrl + 'maintenance/12b39a0daff8fc144fc678663395f6ce5706c778a259167ebc307144fcc96146')
            .then( (res) => {
                expect(res.data).toBeDefined();
                expect(res.data.sha256).toBe(jcHash2)
            })
            .catch( (error) => {
                expect(true).toBe(false)
            })
    })

    test('Get Custom Airport', async () => {
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

    // test('Custom Airport Creation', async() => {
    //     const payload = {user: jcHash, airport: jcTestAirport  }
    //     await axios.post(
    //             apiRootUrl + 'airport', 
    //             payload, 
    //             { headers: {'Content-Type':'application/json'} })
    //         .then( res => {
    //             expect(res.status).toBe(201)
    //             expect(res.data).toBeDefined();
    //             expect(res.data).toBe('TEST created')
    //         })
    //         .catch( () => {
    //             expect(true).toBe(false)
    //         })
    // })

    // test('Create custom page', async () => {
    // })
})

