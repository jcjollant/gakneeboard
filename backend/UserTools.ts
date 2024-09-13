import { Template } from './models/Template';
import { User } from './models/User'
import { UserMiniView } from './models/UserMiniView';
import { TemplateDao } from './TemplateDao';
import { UserDao } from './UserDao'

export class UserTools {
    static facebook:string = 'facebook'
    static google:string = 'google'

    public static async authenticate( body:any):Promise<User> {
        // console.log("User authenticate", JSON.stringify(body))
        if( typeof(body) == 'string') body = JSON.parse(body);
        if( !('source' in body)) throw new Error('Missing source');
        if( !('token' in body)) throw new Error('Missing token');
        let user:User|undefined = undefined;
        if( body.source == UserTools.google) {
            // decode user email
            user = UserTools.decodeGoogle( body.token);
        } else if( body.source == UserTools.facebook) {
            // decode user email
            user = UserTools.decodeFacebook( body.token);
        } else {
            throw new Error('Invalid source');            
        }
        if( !user) throw new Error('Invalid User');

        const dbUser:User|undefined = await UserDao.getUserFromHash(user.sha256)
        if(dbUser) return dbUser;
        
        // new user => creation
        return await UserDao.save(user);
    }
    
    static createUserSha(source:string, email:string) {
        const user = {
            source: source,
            email: email,
        }
        return User.createSha256(user)
    }

    static decodeFacebook(credential:any):User {
        // const credential = JSON.parse(credentialString)
        if(!('authInfo' in credential)) throw new Error('authInfo is required')
        const authInfo = credential.authInfo;
        if(!('id' in authInfo)) throw new Error('id is required')
        const userId = authInfo.id;
        const sha256:string = UserTools.createUserSha(UserTools.facebook, userId)
        const user:User = new User( 0, sha256)
        user.setSource(UserTools.facebook)
        user.setEmail(authInfo.email)
        user.setName(authInfo.first_name)

        return user;
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
        const sha256:string = UserTools.createUserSha(UserTools.google, decodedToken.email)
        const user:User = new User( 0, sha256)
        user.setSource(UserTools.google)
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
        // console.log('[userTools.userMiniFromRequest] user ' + JSON.stringify(user))
        if( !user) return undefined
        const templates:Template[] = await TemplateDao.getOverviewListForUser(user.id)
        const userMini:UserMiniView = new UserMiniView(user, templates)
        // console.log('[userTools.userMiniFromRequest] userMini ' + JSON.stringify(userMini))
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