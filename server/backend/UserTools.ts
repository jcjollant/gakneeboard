import { Business } from './business/Business';
import { UserDao } from './dao/UserDao';
import { Email, EmailType } from './Email';
import { TemplateView } from './models/TemplateView';
import { User } from './models/User';
import { UserView } from './models/UserView';
import { TemplateDao } from './TemplateDao';
import { SupabaseService } from './services/SupabaseService';

export class UserTools {
    static apple: string = 'apple'
    static facebook: string = 'facebook'
    static google: string = 'google'
    static supabase: string = 'supabase'
    static test: string = 'test'
    static defaultUserName: string = 'user'

    public static async authenticate(body: any, userDaoParam: UserDao | undefined = undefined): Promise<User> {
        // console.log("User authenticate", JSON.stringify(body))
        if (typeof (body) == 'string') body = JSON.parse(body);
        if (!('source' in body)) throw new Error('Missing source');
        if (!('token' in body)) throw new Error('Missing token');
        let user: User | undefined = undefined;
        if (body.source == UserTools.google) {
            // decode user email
            user = UserTools.decodeGoogle(body.token);
        } else if (body.source == UserTools.apple) {
            user = UserTools.decodeApple(body.token, body.user);
        } else if (body.source == UserTools.supabase) {
            // Verify Supabase token and create user
            user = await UserTools.decodeSupabase(body.token, body.user);
        } else if (body.source == UserTools.test) {
            user = body.testUser;
        } else {
            throw new Error('Invalid source');
        }
        if (!user) throw new Error('Invalid User');

        // Block private relay emails
        if (user.email.endsWith('@privaterelay.appleid.com')) {
            throw new Error("Sign in with Apple is not allowed with 'Hide My Email'. Please share your real email address or use another sign in method.");
        }

        // Read user from DB
        const userDao = userDaoParam ?? new UserDao()
        const dbUser: User | undefined = await userDao.getFromHash(user.sha256)
        if (dbUser) return dbUser;

        // new user => creation
        Business.primeUser(user)

        if (body.attribution) {
            user.setAttribution(body.attribution)
        }

        // Default name if empty
        if (!user.name) {
            user.setName(this.defaultUserName)
        }

        // Save the new user
        const savedUser = await userDao.save(user);

        // Send email notification as Ned for new user signup

        let emailMessage = `New user signed up!\n` +
            `Name: ${user.name}\n` +
            `Email: ${user.email}\n` +
            `Source: ${user.source}\n` +
            `Account Type: ${user.accountType}\n` +
            `Id: ${savedUser.id}`;

        if (user.attribution) {
            emailMessage += `\n\nAttribution:\n` +
                `Source: ${user.attribution.source || ''}\n` +
                `Medium: ${user.attribution.medium || ''}\n` +
                `Campaign: ${user.attribution.campaign || ''}\n` +
                `Term: ${user.attribution.term || ''}\n` +
                `Content: ${user.attribution.content || ''}`;
        }

        await Email.send(emailMessage, EmailType.NewUser);

        return savedUser;
    }

    static createUserSha(source: string, email: string) {
        const user = {
            source: source,
            email: email,
        }
        return User.createSha256(user)
    }

    static decodeApple(token: string, userAny: any): User {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const tokenData = JSON.parse(jsonPayload);
        console.log('[UserTools.decodeApple]', tokenData)
        const email = tokenData.email;
        const sha256: string = UserTools.createUserSha(UserTools.apple, email)
        const user: User = new User(0, sha256)
        user.setSource(UserTools.apple)
        user.setEmail(email)
        user.setName(userAny?.name?.firstName ?? '')

        return user;
    }

    // static decodeFacebook(credential:any):User {
    //     // const credential = JSON.parse(credentialString)
    //     if(!('authInfo' in credential)) throw new Error('authInfo is required')
    //     const authInfo = credential.authInfo;
    //     if(!('id' in authInfo)) throw new Error('id is required')
    //     const userId = authInfo.id;
    //     const sha256:string = UserTools.createUserSha(UserTools.facebook, userId)
    //     const user:User = new User( 0, sha256)
    //     user.setSource(UserTools.facebook)
    //     user.setEmail(authInfo.email)
    //     user.setName(authInfo.first_name)

    //     return user;
    // }

    /**
     * Decode a google credential into a user
     * @param {*} token 
     * @returns A well formed user object on success, null on failure
     */
    static decodeGoogle(token: string): User {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = atob(base64)
        const decodedToken = JSON.parse(jsonPayload);
        if (!('email' in decodedToken)) throw new Error('email missing')
        const sha256: string = UserTools.createUserSha(UserTools.google, decodedToken.email)
        const user: User = new User(0, sha256)
        user.setSource(UserTools.google)
        user.setEmail(decodedToken.email)


        // figure out a name for this dude
        let userName = ''
        if ('given_name' in decodedToken) {
            userName = decodedToken.given_name
        } else {
            // default to email username
            userName = user.email.split('@')[0]
        }
        user.setName(userName)

        return user
    }

    /**
     * Decode and verify a Supabase access token into a user
     * @param token Supabase access token
     * @param userData Optional user data from Supabase
     * @returns A well formed user object on success, throws error on failure
     */
    static async decodeSupabase(token: string, userData: any = undefined): Promise<User> {
        // Verify the token with Supabase
        const supabaseUser = await SupabaseService.verifyToken(token)

        if (!supabaseUser || !supabaseUser.email) {
            throw new Error('Invalid Supabase token or missing email')
        }

        // Create user hash from email
        const sha256: string = UserTools.createUserSha(UserTools.supabase, supabaseUser.email)
        const user: User = new User(0, sha256)
        user.setSource(UserTools.supabase)
        user.setEmail(supabaseUser.email)

        // Extract name from user metadata or email
        let userName = ''
        if (userData && userData.user_metadata && userData.user_metadata.full_name) {
            userName = userData.user_metadata.full_name
        } else if (supabaseUser.user_metadata && supabaseUser.user_metadata.full_name) {
            userName = supabaseUser.user_metadata.full_name
        } else {
            // Default to email username
            userName = supabaseUser.email.split('@')[0]
        }
        user.setName(userName)

        return user
    }

    static isAdmin(requester: number) {
        return requester == 1
    }

    /**
     * Finds a user from a request (if provided)
     * @param req Inbound request to parse
     * @returns Matching user or undefined if not found
     */
    public static async userMini(user: User): Promise<UserView> {
        const templates: TemplateView[] = await TemplateDao.getOverviewListForUser(user.id)
        return new UserView(user, templates)
    }

    /**
     * Finds a user id from a request (if provided)
     * @param req Inbound request to parse
     * @returns Matching user id or undefined if not found
     */
    public static async userIdFromRequest(req: any): Promise<number | undefined> {
        // console.debug('[UserTools.userIdFromRequest] ', JSON.stringify(req.headers))
        // console.debug('[UserTools.userIdFromRequest] ', JSON.stringify(req.query))
        const sha = UserTools.userShaFromRequest(req)
        // console.debug('[UserTools.userIdFromRequest] sha ', sha)
        // use sha if we have it
        if (!sha) return undefined
        return UserDao.getIdFromHash(sha)
    }

    /**
     * extract the user hash from the request header or headers
     * @param req 
     * @returns 
     */
    public static userShaFromRequest(req: any): string | undefined {
        if (req == undefined) return undefined;

        if (req.query && req.query.user) {
            return String(req.query.user)
        } else if (req.body && req.body.user) {
            return String(req.body.user)
        } else if (req.headers && req.headers['user']) {
            return String(req.headers['user'])
        }
        return undefined
    }

    public static hasValidSource(user: User): boolean {
        return user.source === UserTools.google ||
            user.source === UserTools.apple ||
            user.source === UserTools.facebook ||
            user.source === UserTools.supabase
    }
}
