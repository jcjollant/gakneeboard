import {describe, expect, test} from '@jest/globals';
import { User } from '../backend/models/User'
import { UserTools } from '../backend/UserTools'
import { jcMaxTemplates, jcSource } from './constants'
import { jcHash, jcUserId, jcToken, jcName, jcEmail } from './constants'
import { UserDao } from '../backend/dao/UserDao';
import { UserMiniView } from '../backend/models/UserMiniView';
import { AccountType } from '../backend/models/AccountType';

require('dotenv').config();

const jc = { 'source':UserTools.google,'email':jcEmail}

function testJcUmv(umv:UserMiniView|undefined) {
    expect(umv).toBeDefined()
    if(umv) {
        expect(umv.sha256).toBe(jcHash)
        expect(umv.name).toBe(jcName)
        expect(umv.maxTemp).toBe(jcMaxTemplates)
        expect(umv.templates).toBeDefined()
    }
}

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
        expect(u.accountType).toBe(AccountType.simmer)
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

})

describe('UserTool', () => {
    test('Authenticate and UserMiniView', async () => {
        const body = { 'source':UserTools.google, 'token': jcToken }
        const user = await UserTools.authenticate(body)
        // console.log('user '+JSON.stringify(user))
        expect(user.source).toBe(UserTools.google)
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

        const body3 = { 'source':'notgoogle','token':'sometoken'}
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

    test('userMini', async () => {
        const userJc:User|undefined = await UserDao.getUserFromHash(jcHash)
        if(userJc === undefined) throw new Error('User not found')
        const miniUser:UserMiniView|undefined = await UserTools.userMini(userJc)
        testJcUmv( miniUser)

    })

    test('Save', async () => {
        const existingUser:User = new User(jcUserId, jcHash)
        // Saving an existing user without overwrite should fail
        const userDao = new UserDao()
        await expect(userDao.save(existingUser)).rejects.toEqual('Cannot save existing user without overwrite')

        // generate random email
        const newEmail = Math.random().toString(36).substring(7) + '@test.com'

        // Save a brand new user
        const oldName = 'oldName'
        const newName = 'newName'
        const newHash = UserTools.createUserSha('test', newEmail)
        const newUser:User = new User(0, newHash)
        newUser.setEmail(newEmail)
        newUser.setName(oldName);
        await userDao.save(newUser).then( (user:User) => {
            expect(user.id).toBeGreaterThan(0)
            expect(user.email).toBe(newEmail)
            expect(user.sha256).toBe(newHash)

            // overwritte this user
            const userId = user.id
            user.setName(newName);
            userDao.save(user, true).then( (user:User) => {
                expect(user.id).toBe(userId)
                expect(user.name).toBe(newName)
            })
        })
    })
})

describe('UserMiniView', () => {
    test('fromHash', async () => {
        const userJc:User|undefined = await UserDao.getUserFromHash(jcHash)
        const umv:UserMiniView|undefined = await UserMiniView.fromHash(jcHash)
        testJcUmv(umv)
    })
})

