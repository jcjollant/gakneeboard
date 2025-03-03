import { User } from "../backend/models/User"
import { UserTools } from "../backend/UserTools"

export function newTestUser():User {
    const userName = Math.random().toString(36).substring(5)
    const newEmail = Math.random().toString(36).substring(7) + '@test.com'
    const newHash = UserTools.createUserSha('test', newEmail)
    const newUser = new User(0, newHash)
    newUser.email = newEmail
    newUser.name = userName
    // assign random value between 1 and 25
    newUser.setPrintCredits(Math.floor(Math.random() * 25) + 1)
    // max either 2, 5 or 10
    const max = [2,5,10]
    newUser.setMaxTemplates(max[Math.floor(Math.random() * max.length)])
    // 
    newUser.setPrintCredits(Math.floor(Math.random() * 25) + 1)

    return newUser
}