const axios = require('axios')

import { jcHash, jcTestAirport} from './constants.ts'

describe('index', () => {
    test('Multiple airports query', async () => {
        await axios.get( 'http://localhost:3000/airports/rnt-jfk')
            .then(res => {
                // console.log(res.data)
                // console.log( JSON.stringify(res.data))
                expect(res.data).toBeDefined();
                const list = res.data
                expect(list).toHaveLength(2)
            })
    })

    test('API Version', async () => {
        await axios.get( 'http://localhost:3000/')
            .then(res => {
                // console.log(res.data)
                expect(res.data).toBeDefined();
                expect(res.data).toMatch(/^GA API version /)
            })
    })

    test('Invalid Id', async () => {
        await axios.get( 'http://localhost:3000/airport/ABCDE')
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

    test('Get Custom Airport', async () => {
        await axios.get( 'http://localhost:3000/airport/TEST?user=' + jcHash)
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
    //             'http://localhost:3000/airport', 
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

