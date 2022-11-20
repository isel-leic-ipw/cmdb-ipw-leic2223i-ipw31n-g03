//TODO implementation only for testing
import crypto from "node:crypto"
import {readFile, writeFile} from 'fs/promises'

const UsersFile = './data/users.json'

export async function getUser(userToken) {
    let file = await readFile(UsersFile)
    let obj = JSON.parse(file)
    let users = obj.users
    return users.find(user => user.token === userToken)
}

export async function createUser(username,pwd) {
    let file = await readFile(UsersFile)
    let obj = await JSON.parse(file)
    let users = obj.users
    if (users.find(user => {return user.username === username})){
        return
    }
    let token = crypto.randomUUID()
    let idx = users.length + 1
    let newUser = {
        id: idx,
        token: token,
        username:username,
        pwd:pwd,
        groups:[]
    }
    users.push(newUser)
    obj['users'] = users
    await writeFile(UsersFile, JSON.stringify(obj, null, 2))
    return newUser
}


export async function createGroup(userId, groupRepresentation) {
    let file = await readFile(UsersFile)
    let obj = await JSON.parse(file)
    let user = obj.users.find(user => user.id === userId)
    let groups = user.groups
    let idx = groups.length
        let newGroup = {
            idx:idx+1,
            userId:userId,
            groupRepresentation:groupRepresentation['name'],
            movies:[]
            }
    groups.push(newGroup)
    let userIndex = obj.users.findIndex((user => user.id === userId));
    obj.users[userIndex].groups = groups
    await writeFile(UsersFile, JSON.stringify(obj, null, 2))
    return newGroup


}

export async function getGroups(userId) {
    let file = await readFile(UsersFile)
    let obj = await JSON.parse(file)
    let user = obj.users.find(user => user.id === userId)
    return user['groups']
}





