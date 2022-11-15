//TODO implementation only for testing
import crypto from "node:crypto"

const NUM_USERS = 2

let users = new Array(NUM_USERS).fill(0, 0, NUM_USERS)
    .map((_, idx) => {
        return {
            id: idx,
            token: "ef604e80-a351-4d13-b78f-c888f3e63b6" + idx
        }
    })

export async function getUser(userToken) {
    return users.find(user => user.token == userToken)
}

export async function createUser() {
    let token = crypto.randomUUID()
    let idx = users.length + 1
    let newUser = {
        id: idx,
        token: token
    }
    users.push(newUser)
    return newUser
}