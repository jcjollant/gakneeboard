export const jcHash = 'bfaa2eb49bf63f41c05a016e03653fe2d7f8bf196ba6fb3f3340d3dcd7016770'
export const jcHash2 = '357c3920bbfc6eefef7e014ca49ef12c78bb875c0826efe90194c9978303a8d3'
export const jcUserId = 1
export const asUserId = 2
export const jcName = 'JC'
const jcTestPageFront = {type:'tiles',data:[{"id":0,"name":"airport","data":{"code":"knrt","rwy":"16-34"}},{"id":1,"name":"atis","data":{}},{"id":2,"name":"airport","data":{"code":"KBFI","rwy":"14L-32R","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":3,"name":"airport","data":{"code":"0W0","rwy":"18W-36W","rwyOrientation":"vertical","corners":["weather","twr","field","tpa"]}},{"id":4,"name":"notes","data":{}},{"id":5,"name":"atis","data":{}}]}
const jcTestPageBack = {type:'tiles',data:[{"id":0,"name":"airport","data":{"code":"ktta","rwy":"03-21","pattern":2}},{"id":1,"name":"airport","data":{"code":"kawo","rwy":"all"}},{"id":2,"name":"airport","data":{"code":"s43","rwy":"15R-33L","rwyOrientation":"magnetic"}},{"id":3,"name":"fuel"},{"id":4,"name":"notes","data":{}},{"id":5,"name":"radios","data":[{"target":"NAV1","freq":"116.8","name":"SEA VOR"},{"target":"NAV2","freq":"124.7","name":"OLM VOR"},{"target":"COM1","freq":"124.7","name":"RNT TWR"},{"target":"COM2","freq":"126.95","name":"RNT ATIS"},{"target":"COM1","freq":"123.0","name":"S43 CTAF"},{"target":"COM2","freq":"128.65","name":"PAE ATIS"},{"target":"COM1","freq":"120.2","name":"PAE TWR 34R"},{"target":"COM1","freq":"132.95","name":"PAE TWR 34L"}]}]}
export const jcTestSheetData = [jcTestPageFront,jcTestPageBack]
export const jcTestSheetName = 'TestJC'
export const jcTestSheetId = 55
export const jcTestSheet = {id:jcTestSheetId, name:jcTestSheetName, publish:false, data:jcTestSheetData}
export const postgresUrl = "postgres://default:94chrayEvOLG@ep-shrill-silence-a6ypne6y-pooler.us-west-2.aws.neon.tech/verceldb?sslmode=require"
export const jcTestAirport = {"code":"TEST","name":"Test Airport JC","elev":1000,"freq":[{"name":"CTAF","mhz":124.7},{"name":"TWR","mhz":null},{"name":"Weather","mhz":126.95},{"name":"GND","mhz":121.6}],"rwys":[{"name":"16-34","length":5400,"width":120,"ends":[null]}],"custom":false,"version":6,"effectiveDate":""}
export const jcToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3MTk2NzgzNTFhNWZhZWRjMmU3MDI3NGJiZWE2MmRhMmE4YzRhMTIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NjQzOTUzOTM2NzMtbGk1ZWxzczNndGJoaXBwNnBkanMxcGJnYmwwODY2c2kuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NjQzOTUzOTM2NzMtbGk1ZWxzczNndGJoaXBwNnBkanMxcGJnYmwwODY2c2kuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTMxMTcyMTgxODc5MTQ4MTM3MjgiLCJlbWFpbCI6Impjam9sbGFudEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzE2ODI2Mjg0LCJuYW1lIjoiSkMgSm9sbGFudCIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJejBMVThZd2FUa2ExU2Z6R3FHejR3bDdHTTdla3JVRkwxSzVFc0hfR2pPTlhQWnpBeT1zOTYtYyIsImdpdmVuX25hbWUiOiJKQyIsImZhbWlseV9uYW1lIjoiSm9sbGFudCIsImlhdCI6MTcxNjgyNjU4NCwiZXhwIjoxNzE2ODMwMTg0LCJqdGkiOiI1ZjJkZDU3ZDAzZTY2MGZlMTQ0YjBhZmViMzUwYWFjOWMwOWNlMWI0In0.NY8SxOH1P7WmqsqmXzl7nKOm4fmZxnFhJU6XK_rk7G_YwIEwsMVI_U1HXTiBdlUv_7Bi7mXT_utGnMxMhgbxJo5BHiNYjlvU5gqelusexXF2LIoqoo4hAiXoZiGUkKcIJW-2jpADJtlHvJCHvi8kIiEGQnjtOgTr15G89wyjgGmTIL9S3W0PmODM7_rU4XEJUovqX_yU4XAzxBlPDNfdvMhOOIZk8AECFE4xB5QbHHSqhbmHQ-u8F2t7z0HOGxicq6uG9zufHY4OSfgIDgXNhZ05yBubT9QucWdMUxc-P6_67H2Nn-M28xqLafz7xVO_YRPDPSYbGiuxR6vcDvSaxg'
export const jcEmail = 'jcjollant@gmail.com'

export const currentAsOf = 20240808;
export const currentVersion = 821
export const currentAirportModelVersion = 4
export const krntAtcs =  [
    {mhz:119.2, useCount:6, name:'SEATTLE-TACOMA APPROACH CONTROL'},
    {mhz:120.1, useCount:4, name:'SEATTLE-TACOMA APPROACH CONTROL'},
    {mhz:120.4, useCount:1, name:'SEATTLE-TACOMA APPROACH CONTROL'},
    {mhz:123.9, useCount:3, name:'SEATTLE-TACOMA APPROACH CONTROL'},
    {mhz:125.6, useCount:1, name:'SEATTLE-TACOMA APPROACH CONTROL'},
    {mhz:125.9, useCount:5, name:'SEATTLE-TACOMA APPROACH CONTROL'},
    {mhz:126.5, useCount:4, name:'SEATTLE-TACOMA APPROACH CONTROL'},
    {mhz:128.5, useCount:4, name:'SEATTLE-TACOMA APPROACH CONTROL'},
]
