
import dotenv from 'dotenv'
dotenv.config()

import { UserDao } from '../backend/dao/UserDao';
// declare and execute
async function doIt() {
    const userDao = new UserDao()
    const users = await userDao.getAll()
    users.sort( (a,b) => a.maxTemplates - b.maxTemplates)
    console.log(`Found ${users.length} users`)
    for(const user of users) {
        // console.log( JSON.stringify(user))
        console.log( `${user.id} => ${user.maxTemplates}`)
    }
}

doIt().then(() => {
    console.log('done')
})
