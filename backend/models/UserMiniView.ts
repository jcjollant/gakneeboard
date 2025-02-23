import { TemplateDao } from '../TemplateDao';
import { Business } from '../business/Business';
import { UserDao } from '../dao/UserDao';
import { AccountType } from './AccountType';
import { Template as Template } from './Template';
import { User } from './User'

export class UserMiniView {
    sha256: string;
    name: string;
    maxPages: number;
    maxTemp: number;
    templates: Template[];
    accountType: AccountType;

    constructor(user:User, templates:Template[]) {
        this.sha256 = user.sha256;
        this.name = user.name;
        this.maxPages = Business.maxPagesFromAccountType(user.accountType)
        this.maxTemp = user.maxTemplates;
        this.templates = templates;
        this.accountType = user.accountType;
    }

    static fromHash(hash: string):Promise<UserMiniView|undefined> {
        return new Promise(async (resolve, reject) => {
            const user = await UserDao.getUserFromHash(hash)
            if(!user) {
                resolve(undefined)
                return
            }
            
            const templates = await TemplateDao.getOverviewListForUser(user.id)
            resolve(new UserMiniView(user, templates))
        })
    }
}