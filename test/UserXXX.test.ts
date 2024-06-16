import {describe, expect, test} from '@jest/globals';
import { User } from '../backend/models/User'
import { UserTools } from '../backend/UserTools'
import { hashJc, postgresUrl } from './constants'

process.env.POSTGRES_URL=postgresUrl

const emailJc = 'jcjollant@gmail.com'
const userIdJc = 1
const jc = { 'source':'google','email':emailJc}
const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3MTk2NzgzNTFhNWZhZWRjMmU3MDI3NGJiZWE2MmRhMmE4YzRhMTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NjQzOTUzOTM2NzMtbGk1ZWxzczNndGJoaXBwNnBkanMxcGJnYmwwODY2c2kuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NjQzOTUzOTM2NzMtbGk1ZWxzczNndGJoaXBwNnBkanMxcGJnYmwwODY2c2kuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTMxMTcyMTgxODc5MTQ4MTM3MjgiLCJlbWFpbCI6Impjam9sbGFudEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzE2ODI2Mjg0LCJuYW1lIjoiSkMgSm9sbGFudCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJejBMVThZd2FUa2ExU2Z6R3FHejR3bDdHTTdla3JVRkwxSzVFc0hfR2pPTlhQWnpBeT1zOTYtYyIsImdpdmVuX25hbWUiOiJKQyIsImZhbWlseV9uYW1lIjoiSm9sbGFudCIsImlhdCI6MTcxNjgyNjU4NCwiZXhwIjoxNzE2ODMwMTg0LCJqdGkiOiI1ZjJkZDU3ZDAzZTY2MGZlMTQ0YjBhZmViMzUwYWFjOWMwOWNlMWI0In0.NY8SxOH1P7WmqsqmXzl7nKOm4fmZxnFhJU6XK_rk7G_YwIEwsMVI_U1HXTiBdlUv_7Bi7mXT_utGnMxMhgbxJo5BHiNYjlvU5gqelusexXF2LIoqoo4hAiXoZiGUkKcIJW-2jpADJtlHvJCHvi8kIiEGQnjtOgTr15G89wyjgGmTIL9S3W0PmODM7_rU4XEJUovqX_yU4XAzxBlPDNfdvMhOOIZk8AECFE4xB5QbHHSqhbmHQ-u8F2t7z0HOGxicq6uG9zufHY4OSfgIDgXNhZ05yBubT9QucWdMUxc-P6_67H2Nn-M28xqLafz7xVO_YRPDPSYbGiuxR6vcDvSaxg'
const nameJc = 'JC'

describe( 'User', () => {
    test('Encryption', async () => {
        expect(User.createSha256(jc)).toBe(hashJc)
        const userJc = new User('google', emailJc)
        expect(userJc.sha256).toBe(hashJc)
    })
    
})

describe('UserTool', () => {
    test('Authenticate and getMini', async () => {
        const body = { 'source':'google', 'token': token }
        const user = await UserTools.authenticate(body)
        // console.log('user '+JSON.stringify(user))
        expect(user.source).toBe('google')
        expect(user.email).toBe(emailJc)
        expect(user.sha256).toBe(hashJc)

        const miniUser = user.getMini();
        // should only have sha256 and name
        expect(miniUser.sha256).toBe(hashJc)
        expect(miniUser.name).toBe(nameJc)
        expect(miniUser['source']).toBeUndefined()
        expect(miniUser['email']).toBeUndefined()
    })

    test('userFromRequest', async () => {
        expect( await UserTools.userFromRequest(undefined)).toBeUndefined()
        const req1 = {}
        expect( await UserTools.userFromRequest(req1)).toBeUndefined()
        const req2 = { query: {}}
        expect( await UserTools.userFromRequest(req2)).toBeUndefined()
        const req3 = { query: { user: {}}}
        expect( await UserTools.userFromRequest(req3)).toBeUndefined()
        const req4 = { query: { user: hashJc}}
        expect( await UserTools.userFromRequest(req4)).toBe( userIdJc)

    })
        
    
})

