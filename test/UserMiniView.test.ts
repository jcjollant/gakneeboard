import { describe, expect, it, jest} from '@jest/globals';
import { newTestUser } from './common';
import { UserMiniView } from '../backend/models/UserMiniView';
import { UserDao } from '../backend/dao/UserDao';
import { User } from '../backend/models/User';
import { jcHash, jcMaxTemplates, jcName } from './constants';

require('dotenv').config();


describe('UserMiniView', () => {

    describe('constructor', () => {
        it('should create UserMiniView instance with correct properties', () => {
            const user = newTestUser()
            const maxTemplates = 3
            const printCredits = 7 
            user.setMaxTemplates(maxTemplates)
            user.setPrintCredits(printCredits)
            const userMiniView = new UserMiniView(user, [])
            expect(userMiniView.sha256).toBe(user.sha256);
            expect(userMiniView.name).toBe(user.name);
            expect(userMiniView.accountType).toBe(user.accountType);
            expect(userMiniView.printCredits).toBe(printCredits);
            expect(userMiniView.templates).toHaveLength(0);
            expect(userMiniView.maxTemp).toBe(maxTemplates)
        });

        it('should retrieve from hash', async () => {
            const userJc:User|undefined = await UserDao.getUserFromHash(jcHash)
            const umv:UserMiniView|undefined = await UserMiniView.fromHash(jcHash)
            expect(umv).toBeDefined()
            if( !umv) return;
            expect(umv.sha256).toBe(jcHash)
            expect(umv.name).toBe(jcName)
            expect(umv.templates).toBeDefined()
        })
    });

});
