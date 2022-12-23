import crypto from "node:crypto"
import {readFile, writeFile} from 'fs/promises'
import * as imdb from './imdb-movies-data.mjs'
import errors from "../errors.mjs";
import url from "url";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const UsersFile = `${__dirname}/users.json`

export async function getUser(userToken) {
    let data = await getData()
    let users = data.users
    return users.find(user => user.token === userToken)
}

export async function removeUser(userToken) {
    let data = await getData()
    let users = data.users
    let user = users.find(user => user.token === userToken)
    users.pop(user)
    await saveData(data)
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
    return {
        id:newGroup.id,
        name:newGroup.name,
        description:newGroup.description
    }
}

export async function getGroups(userId) {
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    return user.groups.map(({id,name,description,movies}) => ({
        id:id,
        name:name,
        description:description,
        movies:movies
    }))
}


export async function getGroup(userId,groupId) {
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    if (!group) { return }
    return {
        id:group.id,
        name:group.name,
        description:group.description,
        totalDuration:group.movies.reduce((accumulator, currentValue) => accumulator + currentValue.duration,0),
        movies:group.movies
    }
}


export async function deleteGroup(userId, groupId){
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    if (!group){ return }
    user.groups.pop(group)
    await saveData(data)
    return group

}

export async function updateGroup(userId, groupId,groupDescription){
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    if (!group){ return }
    group.name = groupDescription.name
    group.description = groupDescription.description
    await saveData(data)
    return group
}
export async function addMovie(userId, groupId, movieId){
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    if(!group){
        return
    }
    let movieImdb = await imdb.getMovie(movieId)
    if (!movieImdb) throw errors.MOVIE_NOT_FOUND(movieId)
    if ( !(group.movies.some(movie=> movie.id === movieId))){
        group.movies.push(movieImdb)
    }else{
        let idx = group.movies.findIndex(movie => movie.id === movieId )
        group.movies[idx] = movieImdb
    }

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

export async function removeMovie(userId, groupId, movieId){
    let data = await getData()
    let user = data.users.find(user => user.id === userId)
    let group = user.groups.find(group => group.id === groupId)
    if (group === undefined) return
    let movie = group.movies.find(movie => movie.id === movieId)
    if (movie === undefined) throw errors.MOVIE_NOT_FOUND(movieId)
    group.movies.pop(movie)
    await saveData(data)
    return group
}





