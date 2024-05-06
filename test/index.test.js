const axios = require('axios')


test('Multiple airports query', async () => {
    await axios.get( 'http://localhost:3000/airports/rnt-jfk')
    .then(res => {
        console.log(res.data)
        // console.log( JSON.stringify(res.data))
        expect(res.data).toBeDefined();
        const list = res.data
        expect(list.length).toBe(2)
    })
})
