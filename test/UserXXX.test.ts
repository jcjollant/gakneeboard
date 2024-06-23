import {describe, expect, test} from '@jest/globals';
import { User } from '../backend/models/User'
import { UserTools } from '../backend/UserTools'
import { postgresUrl } from './constants'
import { jcHash, jcUserId, jcToken, jcName, jcEmail } from './constants'
import { UserDao } from '../backend/UserDao';

process.env.POSTGRES_URL=postgresUrl

const jc = { 'source':'google','email':jcEmail}

describe( 'User', () => {
    test('Encryption', async () => {
        expect(User.createSha256(jc)).toBe(jcHash)
        const userJc = new User('google', jcEmail)
        expect(userJc.sha256).toBe(jcHash)
    })
    
})

describe('UserTool', () => {
    test('Authenticate and getMini', async () => {
        const body = { 'source':'google', 'token': jcToken }
        const user = await UserTools.authenticate(body)
        // console.log('user '+JSON.stringify(user))
        expect(user.source).toBe('google')
        expect(user.email).toBe(jcEmail)
        expect(user.sha256).toBe(jcHash)

        const miniUser = user.getMini();
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

    test('userFromRequest', async () => {
        expect( await UserTools.userFromRequest(undefined)).toBeUndefined()
        const req1 = {}
        expect( await UserTools.userFromRequest(req1)).toBeUndefined()
        const req2 = { query: {}}
        expect( await UserTools.userFromRequest(req2)).toBeUndefined()
        const req3 = { query: { user: {}}}
        expect( await UserTools.userFromRequest(req3)).toBeUndefined()
        const req4 = { query: { user: jcHash}}
        expect( await UserTools.userFromRequest(req4)).toBe( jcUserId)

    })
        
    test('Save', async () => {
        const input:User = new User('google', jcEmail)
        // Saving an existing user should return its id
        const output = await UserDao.save(input)
        expect(output.id).toBe(jcUserId)
    })
})

