const crypto = require('crypto');
const salt = 'HakunaMattata';

function authenticate( body) {
    // console.log("User authenticate " + typeof(body))
    if( typeof(body) == 'string') body = JSON.parse(body);
    try {
        if( !('source' in body)) throw new Error('Missing source');
        if( body.source != 'google') throw new Error('Invalid source');
        // decode user email
        if( !('token' in body)) throw new Error('Missing token');
        const user = decodeGoogleUser( body.token);
        if( !user) throw new Error('Invalid User');
        console.log('User authenticate ' + user.sha256)
        // TODO: check if user exists in DB

    } catch (e) {
        console.log( 'User authenticate failed ' + e.message);
        return null;
    }        
}

/**
 * Decode a google credential into a user
 * @param {*} credential 
 * @returns A well formed user object on success, null on failure
 */
function decodeGoogleUser(credential) {
    const base64Url = credential.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // console.log('User authenticate base64 ' + base64);
    const jsonPayload = atob(base64)
    // console.log('User authenticate jsonPayload ' + jsonPayload)
    // const jsonPayload = decodeURIComponent(
    //   window
    //     .atob(base64)
    //     .split("")
    //     .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
    //     .join(""),
    // );
    const decodedToken = JSON.parse(jsonPayload);
    if(!('email' in decodedToken)) return null
    // return {
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
    // };
    const user = {
        source: 'google',
        email: decodedToken.email,
    }

    user.sha256 = getSHA256ofJSON(user);
    return user
}

function getSHA256ofJSON(input){
    return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex')
}

module.exports = { authenticate }