const axios = require('axios')

import { hashJc} from './constants.ts'

describe('index', () => {
    test('Multiple airports query', async () => {
        try {
            await axios.get( 'http://localhost:3000/airports/rnt-jfk')
            .then(res => {
                console.log(res.data)
                // console.log( JSON.stringify(res.data))
                expect(res.data).toBeDefined();
                const list = res.data
                expect(list.length).toBe(2)
            })

        } catch( e) {
            // console.log('error : ' + e)
        }
    })

    test('API Version', async () => {
        const result = await axios.get( 'http://localhost:3000/')
        .then(res => {
            // console.log(res.data)
            expect(res.data).toBeDefined();
            expect(res.data).toMatch(/^GA API version /)
        })
    })

    test('Invalid Id', async () => {
        const result = await axios.get( 'http://localhost:3000/airport/ABCDE')
            .catch( (error) => {
                expect(error.response.status).toBe(400);
            })
    })

    test('Get Custom Airport', async () => {
        const result = await axios.get( 'http://localhost:3000/airport/TEST?user=' + hashJc)
            .then( (res) => {
                expect(res.data).toBeDefined();
                expect(res.data.code).toBe('TEST')
            })
            .catch( (error) => {
                expect(error.response.status).toBe(400);
            })
    })

})

