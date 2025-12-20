import { describe, expect, test } from '@jest/globals';
import { GApi } from '../backend/GApi';
import { UserMiniView } from '../backend/models/UserMiniView';
import { UserTools } from '../backend/UserTools';
import { jcHash, jcName, jcToken, jcUserId } from './constants';

import * as dotenv from 'dotenv';
dotenv.config()

describe('GApi Tests', () => {


    // Airport related tests moved to AirportService.test.ts


    test('Authenticate', async () => {
        const body = { 'source': UserTools.google, 'token': jcToken }
        await GApi.authenticate(body).then((user: UserMiniView) => {
            // console.log(JSON.stringify(user))
            expect(user.name).toBe(jcName)
            expect(user.sha256).toBe(jcHash)
            expect(user.templates).toBeDefined()
        }).catch((e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })

    test('shaToid', async () => {
        await GApi.userShaToId(jcHash).then(id => {
            expect(id).toBe(jcUserId)
        }).catch((e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
        // Bogus Hash should return undefined
        await GApi.userShaToId('bogusHash').then(id => {
            expect(id).toBeUndefined()
        }).catch((e) => {
            console.log(e)
            expect(true).toBe(false) // should not get here
        })
    })

    test('Session', async () => {
        const req1 = {}
        const session1 = await GApi.getSession(req1)
        expect(session1).toBeDefined()
        expect(session1.version).toBeDefined()
        expect(session1.aced).toBeDefined()
        expect(session1.camv).toBeDefined()
        expect(session1.user).toBeUndefined()
        const req2 = { query: { user: jcHash } }
        const session2 = await GApi.getSession(req2)
        expect(session2).toBeDefined()
        expect(session2.version).toBeDefined()
        expect(session2.aced).toBeDefined()
        expect(session2.camv).toBeDefined()
        expect(session2.user).toBeDefined()

    })
})


