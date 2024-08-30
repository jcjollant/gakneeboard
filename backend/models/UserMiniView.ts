import { TemplateDao } from '../TemplateDao';
import { UserDao } from '../UserDao';
import { Template as Template } from './Template';
import { User } from './User'

export class UserMiniView {
    sha256: string;
    name: string;
    maxTemp: number;
    templates: Template[];

    constructor(user:User, templates:Template[]) {
        this.sha256 = user.sha256;
        this.name = user.name;
        this.maxTemp = user.maxTemplates;
        this.templates = templates;
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
        throw new Error('Method not implemented.');
    }
}