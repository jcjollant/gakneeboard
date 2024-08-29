import { Template } from './models/Template';
import { User } from './models/User'
import { UserMiniView } from './models/UserMiniView';
import { TemplateDao } from './TemplateDao';
import { UserDao } from './UserDao'

export class UserTools {

    public static async authenticate( body:any):Promise<User> {
        // console.log("User authenticate " + typeof(body))
        if( typeof(body) == 'string') body = JSON.parse(body);
        if( !('source' in body)) throw new Error('Missing source');
        if( body.source != 'google') throw new Error('Invalid source');
        // decode user email
        if( !('token' in body)) throw new Error('Missing token');
        const user:User = UserTools.decodeGoogle( body.token);
        if( !user) throw new Error('Invalid User');
        // console.log('[user.authenticate] decoded ' + JSON.stringify(user))
        // console.log('[user.authenticate] ' + user.sha256)
        return await UserDao.save(user);
    }
    
    static createUserSha(source:string, email:string) {
        const user = {
            source: source,
            email: email,
        }
        return User.createSha256(user)
    }


    /**
     * Decode a google credential into a user
     * @param {*} credential 
     * @returns A well formed user object on success, null on failure
     */
    static decodeGoogle(credential:string):User {
        const base64Url = credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = atob(base64)
        const decodedToken = JSON.parse(jsonPayload);
        if(!('email' in decodedToken)) throw new Error('email missing')
        //   email: decodedToken.email,
        //   email_verified: decodedToken.email_verified,
        //   hd: decodedToken.hd,
        //   family_name: decodedToken.family_name,
        //   given_name: decodedToken.given_name,
        //   name: decodedToken.name,
        //   picture: decodedToken.picture,
        //   id: decodedToken.sub,
        //   iat: decodedToken.iat,
        //   exp: decodedToken.exp,
        const sha256:string = UserTools.createUserSha('google', decodedToken.email)
        const user:User = new User( 0, sha256)
        user.setSource('google')
        user.setEmail(decodedToken.email)


        // figure out a name for this dude
        let userName = ''
        if('given_name' in decodedToken) {
            userName = decodedToken.given_name
        } else {
            // default to email username
            userName = user.email.split('@')[0]
        }
        user.setName( userName)

        return user
    }

    /**
     * Finds a user from a request (if provided)
     * @param req Inbound request to parse
     * @returns Matching user or undefined if not found
     */
    public static async userMiniFromRequest(req:any):Promise<UserMiniView|undefined> {
        if( req == undefined || req.query == undefined || req.query.user == undefined) return undefined
        const user:User|undefined = await UserDao.getUserFromHash(req.query.user)
        if( !user) return undefined
        const templates:Template[] = await TemplateDao.getOverviewListForUser(user.id)
        const userMini:UserMiniView = new UserMiniView(user, templates)
        return userMini
    }

    /**
     * Finds a user id from a request (if provided)
     * @param req Inbound request to parse
     * @returns Matching user id or undefined if not found
     */
    public static async userIdFromRequest(req:any):Promise<number|undefined> {
        if( req == undefined || req.query == undefined || req.query.user == undefined) return undefined
        return UserDao.getIdFromHash(req.query.user)
    }
}