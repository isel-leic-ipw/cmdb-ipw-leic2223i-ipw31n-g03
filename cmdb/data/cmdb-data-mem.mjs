import crypto from "node:crypto"
import {readFile, writeFile} from 'fs/promises'
import * as imdb from './imdb-movies-data.mjs'

const UsersFile = './data/users.json'

export async function getUser(userToken) {
    let data = await getData()
    let users = data.users
    return users.find(user => user.token === userToken)
}

export async function createUser() {
    let data = await getData()
    let users = data.users
    let token = crypto.randomUUID()
    let idx = users.length + 1
    let newUser = {
        id: idx,
        token: token,
        groups:[]
    }
    users.push(newUser)
    await saveData(data)
    return newUser
}


export async function createGroup(userId, groupRepresentation) {
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let groups = user.groups
    let idx = groups.length
        let newGroup = {
            id:idx+1,
            name:groupRepresentation['name'],
            description:groupRepresentation['description'],
            movies:[]
            }
    groups.push(newGroup)
    await saveData(data)
    return newGroup


}

export async function getGroups(userId) {
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    return user.groups
}

export async function getGroup(userId, groupId) {
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    return user.groups.find(group => group.id === groupId)
}

export async function deleteGroup(userId, groupId){
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    user.groups.pop(group)
    await saveData(data)
    return group

}

export async function updateGroup(userId, groupId,groupDescription){
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    group.name = groupDescription.name
    group.description = groupDescription.description
    await saveData(data)
    return group
}
export async function addMovie(userId, groupId, movieId){
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    let movie = await imdb.getMovie(movieId)
    group.movies.push(movie)
    await saveData(data)
    return group
}

export async function removeMovie(userId, groupId, movieId){
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    let movie = group.movies.find(movie => movie.id === movieId)
    group.movies.pop(movie)
    await saveData(data)
    return group
}
//aux functions

async function getData(){
    let file = await readFile(UsersFile)
    return JSON.parse(file)
}

async function saveData(data){
    await writeFile(UsersFile, JSON.stringify(data,null, 2))
}





