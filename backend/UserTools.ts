import { User } from './models/User'
import { UserDao } from './UserDao'

export class UserTools {

    public static async authenticate( body:any):Promise<User> {
        // console.log("User authenticate " + typeof(body))
        if( typeof(body) == 'string') body = JSON.parse(body);
        if( !('source' in body)) throw new Error('Missing source');
        if( body.source != 'google') throw new Error('Invalid source');
        // decode user email
        if( !('token' in body)) throw new Error('Missing token');
        const user = UserTools.decodeGoogle( body.token);
        await UserDao.save(user);
        // console.log('[user.authenticate] decoded ' + JSON.stringify(user))
        if( !user) throw new Error('Invalid User');
        // console.log('[user.authenticate] ' + user.sha256)
        return user
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
        const user:User = new User( 'google', decodedToken.email)
        
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

    public static async userFromRequest(req:any):Promise<number|undefined> {
        if( req == undefined || req.query == undefined || req.query.user == undefined) return undefined
        return UserDao.find(req.query.user)
    }
}