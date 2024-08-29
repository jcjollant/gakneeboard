import {describe, expect, test} from '@jest/globals';
import { User } from '../backend/models/User'
import { UserTools } from '../backend/UserTools'
import { jcSource, postgresUrl } from './constants'
import { jcHash, jcUserId, jcToken, jcName, jcEmail } from './constants'
import { UserDao } from '../backend/UserDao';
import { UserMiniView } from '../backend/models/UserMiniView';
import { exitCode } from 'process';

process.env.POSTGRES_URL=postgresUrl

const jc = { 'source':'google','email':jcEmail}

describe( 'User', () => {
    test('Encryption', async () => {
        expect(User.createSha256(jc)).toBe(jcHash)
        expect(UserTools.createUserSha(jcSource, jcEmail)).toBe(jcHash)
    })

    test('Constructor', () => {
        const hash = 'hash'
        const u = new User( 1, hash)
        expect(u.id).toBe(1)
        expect(u.sha256).toBe(hash)
        expect(u.source).toBe('')
        expect(u.email).toBe('')
        expect(u.name).toBe('')
        expect(u.maxTemplates).toBe(User.defaultMaxTemplates)
    })    

    test('setters', () => {
        const u = new User(1, 'hash')
        u.setEmail('email')
        u.setSource('source')
        u.setMaxTemplates(10)
        u.setName('name')
        expect(u.email).toBe('email')
        expect(u.source).toBe('source')
        expect(u.maxTemplates).toBe(10)
        expect(u.name).toBe('name')
    })

    test('fromJson', () => {
        const name = 'Paul'
        const source = 'SomeSource'
        const email = 'paul@example.com'
        const maxTemplates = 12
        const data:string = JSON.stringify( {name:name,source:source,email:email,maxTemplates:maxTemplates})
        const user:User = User.fromJson(1,'sha',data)
        expect(user.id).toBe(1)
        expect(user.sha256).toBe('sha')
        expect(user.name).toBe(name)
        expect(user.source).toBe(source)
        expect(user.email).toBe(email)
        expect(user.maxTemplates).toBe(maxTemplates)
    })
})

describe('UserTool', () => {
    test('Authenticate and UserMiniView', async () => {
        const body = { 'source':'google', 'token': jcToken }
        const user = await UserTools.authenticate(body)
        // console.log('user '+JSON.stringify(user))
        expect(user.source).toBe('google')
        expect(user.email).toBe(jcEmail)
        expect(user.sha256).toBe(jcHash)

        const miniUser:UserMiniView = new UserMiniView(user,[])
        // should only have sha256 and name
        expect(miniUser.sha256).toBe(jcHash)
        expect(miniUser.name).toBe(jcName)
        expect(miniUser['source']).toBeUndefined()
        expect(miniUser['email']).toBeUndefined()

        const body2 = {}
        await UserTools.authenticate(body2).then( () => {
            expect(true).toBe(false)
        }).catch( (err) => {
            expect(err.message).toBe('Missing source')
        })

        const body3 = { 'source':'notgoogle'}
        await UserTools.authenticate(body3).then( () => {
            expect(true).toBe(false)
        }).catch( (err) => {
            expect(err.message).toBe('Invalid source')
        })
    })

    test('userIdFromRequest', async () => {
        expect( await UserTools.userIdFromRequest(undefined)).toBeUndefined()
        const req1 = {}
        expect( await UserTools.userIdFromRequest(req1)).toBeUndefined()
        const req2 = { query: {}}
        expect( await UserTools.userIdFromRequest(req2)).toBeUndefined()
        const req3 = { query: { user: {}}}
        expect( await UserTools.userIdFromRequest(req3)).toBeUndefined()
        const req4 = { query: { user: jcHash}}
        expect( await UserTools.userIdFromRequest(req4)).toBe( jcUserId)
    })

    test('userMiniFromRequest', async () => {
        expect( await UserTools.userMiniFromRequest(undefined)).toBeUndefined()
        const req1 = {}
        expect( await UserTools.userMiniFromRequest(req1)).toBeUndefined()
        const req2 = { query: {}}
        expect( await UserTools.userMiniFromRequest(req2)).toBeUndefined()
        const req3 = { query: { user: {}}}
        expect( await UserTools.userMiniFromRequest(req3)).toBeUndefined()
        const req4 = { query: { user: jcHash}}
        const miniUser:UserMiniView|undefined = await UserTools.userMiniFromRequest(req4)
        expect(miniUser).toBeDefined()
        if(miniUser) {
            expect(miniUser.sha256).toBe(jcHash)
            expect(miniUser.name).toBe(jcName)
            expect(miniUser.maxTemp).toBe(User.defaultMaxTemplates)
            expect(miniUser.templates.length).toBeGreaterThan(0)
        }

    })

    test('Save', async () => {
        const input:User = new User(jcUserId, jcHash)
        // Saving an existing user should return its id
        const output = await UserDao.save(input)
        expect(output.id).toBe(jcUserId)
    })
})

