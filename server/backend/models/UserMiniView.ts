import { TemplateDao } from '../TemplateDao';
import { Business } from '../business/Business';
import { UserDao } from '../dao/UserDao';
import { AccountType } from '@checklist/shared';
import { TemplateView } from './TemplateView';
import { User } from './User'

export class UserMiniView {
    sha256: string;
    name: string;
    maxPages: number; // max pages across all templates
    maxTemp: number; // max templates
    templates: TemplateView[];
    accountType: AccountType;
    printCredits: number;
    eulaCurrent: boolean;
    homeAirport: string | undefined;

    constructor(user: User, templates: TemplateView[]) {
        this.sha256 = user.sha256;
        this.name = user.name;
        this.maxPages = user.maxPages
        this.maxTemp = user.maxTemplates;
        this.templates = templates;
        this.accountType = user.accountType;
        this.printCredits = user.printCredits;
        this.eulaCurrent = user.eula >= Business.latestEula;
        this.homeAirport = user.homeAirport;
    }

    static fromHash(hash: string): Promise<UserMiniView | undefined> {
        return new Promise(async (resolve, reject) => {
            const user = await UserDao.getUserFromHash(hash)
            if (!user) {
                resolve(undefined)
                return
            }

            const templates = await TemplateDao.getOverviewListForUser(user.id)
            resolve(new UserMiniView(user, templates))
        })
    }
}