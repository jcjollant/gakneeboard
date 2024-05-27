const users = require( '../backend/users')

process.env.POSTGRES_URL="postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"

const emailJc = 'jcjollant@gmail.com'
const hashJc = 'bfaa2eb49bf63f41c05a016e03653fe2d7f8bf196ba6fb3f3340d3dcd7016770'
const jc = { 'source':'google','email':emailJc}
const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3MTk2NzgzNTFhNWZhZWRjMmU3MDI3NGJiZWE2MmRhMmE4YzRhMTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NjQzOTUzOTM2NzMtbGk1ZWxzczNndGJoaXBwNnBkanMxcGJnYmwwODY2c2kuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NjQzOTUzOTM2NzMtbGk1ZWxzczNndGJoaXBwNnBkanMxcGJnYmwwODY2c2kuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTMxMTcyMTgxODc5MTQ4MTM3MjgiLCJlbWFpbCI6Impjam9sbGFudEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzE2ODI2Mjg0LCJuYW1lIjoiSkMgSm9sbGFudCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJejBMVThZd2FUa2ExU2Z6R3FHejR3bDdHTTdla3JVRkwxSzVFc0hfR2pPTlhQWnpBeT1zOTYtYyIsImdpdmVuX25hbWUiOiJKQyIsImZhbWlseV9uYW1lIjoiSm9sbGFudCIsImlhdCI6MTcxNjgyNjU4NCwiZXhwIjoxNzE2ODMwMTg0LCJqdGkiOiI1ZjJkZDU3ZDAzZTY2MGZlMTQ0YjBhZmViMzUwYWFjOWMwOWNlMWI0In0.NY8SxOH1P7WmqsqmXzl7nKOm4fmZxnFhJU6XK_rk7G_YwIEwsMVI_U1HXTiBdlUv_7Bi7mXT_utGnMxMhgbxJo5BHiNYjlvU5gqelusexXF2LIoqoo4hAiXoZiGUkKcIJW-2jpADJtlHvJCHvi8kIiEGQnjtOgTr15G89wyjgGmTIL9S3W0PmODM7_rU4XEJUovqX_yU4XAzxBlPDNfdvMhOOIZk8AECFE4xB5QbHHSqhbmHQ-u8F2t7z0HOGxicq6uG9zufHY4OSfgIDgXNhZ05yBubT9QucWdMUxc-P6_67H2Nn-M28xqLafz7xVO_YRPDPSYbGiuxR6vcDvSaxg'

test('Encryption', async () => {
    expect(users.getSHA256(jc)).toBe(hashJc)
})

test('Authenticate', async () => {
    const body = { 'source':'google', 'token': token }
    const user = await users.authenticate(body)
    expect(user.source).toBe('google')
    expect(user.email).toBe(emailJc)
    expect(user.sha256).toBe(hashJc)
})
