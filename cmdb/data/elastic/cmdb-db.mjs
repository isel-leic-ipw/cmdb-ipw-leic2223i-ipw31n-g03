import elasticHttpClient from "./elastic-http-client.mjs"
import * as imdb from '../common/imdb-movies-data.mjs'
import crypto from "node:crypto";
import errors from "../../errors.mjs";

const USERS_IDX = "users"
const GROUPS_IDX = "groups"

export async function getUser(userToken) {
    const hits = await elasticHttpClient(USERS_IDX).search({
        query: {
            match: {
                token: userToken
            }
        }
    })

    if (hits.length > 1) return undefined

    const user = hits[0].body

    return {
        id: hits[0].id,
        username: user.username,
        password: user.password,
        token: user.token
    }
}

export async function getUserWeb(username, password) {
    const hits = await elasticHttpClient(USERS_IDX).search({
        query: {
            match: {
                username: username
            }
        }
    })

    const hit = hits.find(hit => hit.body.password === password)

    if (!hit) return undefined

    const user = hit.body

    return {
        id: hit.id,
        username: user.username,
        password: user.password,
        token: user.token
        //, groups: user.groups
    }
}

export async function getMovieDetails(groupId, movieId) {
    const group = await getGroup(groupId)

    if (!group) return undefined

    const movie = group.movies.find(movie => movie.id === movieId)

    if(!movie) throw errors.MOVIE_NOT_FOUND(movieId)

    return movie
}

export async function removeUser(userId) {
    const response = await elasticHttpClient(USERS_IDX).delete(userId)
    return response.result
}


export async function createUser(username, password) {
    const user = {
        username: username,
        password: password,
        token: crypto.randomUUID()
    }
    const response = await elasticHttpClient(USERS_IDX).create(user).catch(reason => console.log(reason))

    if(response.result) {
        return user
    }

    return undefined
}

export async function createGroup(user, groupRepresentation) {
    groupRepresentation = {
        user: user.id,
        name: groupRepresentation.name,
        description: groupRepresentation.description,
        movies: []
    }
    const response = await elasticHttpClient(GROUPS_IDX).create(groupRepresentation)

    if(response.result) {
        return {
            id: response.id,
            name: groupRepresentation.name,
            description: groupRepresentation.description,
            movies: groupRepresentation.movies
        }
    }

    return undefined
}

export async function getGroups(userId) {
    const hits = await elasticHttpClient(GROUPS_IDX).search({
        query: {
            match: {
                user: userId
            }
        }
    })

    return hits.map(hit => {
        let group = hit.body
        return {
            id: hit.id,
            name: group.name,
            description: group.description,
            movies: group.movies
        }
    })
}

export async function getGroup(groupId) {
    const response = await elasticHttpClient(GROUPS_IDX).get(groupId)

    const group = response.body

    return {
        id: response.id,
        user: group.user,
        name: group.name,
        description: group.description,
        totalDuration: group.movies.reduce((accumulator, currentValue) => accumulator + currentValue.duration,0),
        movies: group.movies
    }
}

export async function deleteGroup(groupId) {
    const group = await getGroup(groupId)
    const response = await elasticHttpClient(GROUPS_IDX).delete(groupId)

    if(response.result) {
        return group
    }

    return undefined
}

export async function updateGroup(groupId, groupRepresentation) {
    const group = await getGroup(groupId)
    group.name = groupRepresentation.name
    if (group.description !== groupRepresentation.description) {
        group.description = groupRepresentation.description
    }
    if (groupRepresentation.movies) {
        group.movies = groupRepresentation.movies
    }

    const response = await elasticHttpClient(GROUPS_IDX).update(groupId, {
        user: group.user,
        name: group.name,
        description: group.description,
        movies: group.movies
    })

    if(response.result) {
        return {
            id: groupId,
            name: group.name,
            description: group.description,
            movies: group.movies
        }
    }

    return undefined
}

export async function addMovie(groupId, movieId) {
    const movieImdb = await imdb.getMovie(movieId)
    const group = await getGroup(groupId)

    if (!movieImdb) throw errors.MOVIE_NOT_FOUND(movieId)

    if (!(group.movies.some(movie => movie.id === movieId))) {
        group.movies.push(movieImdb)
    } else {
        let idx = group.movies.findIndex(movie => movie.id === movieId )
        group.movies[idx] = movieImdb
    }

    return await updateGroup(groupId, group)
}

export async function removeMovie(groupId, movieId) {
    const group = await getGroup(groupId)
    if (!group) return undefined

    const index = group.movies.findIndex(movie => movie.id === movieId)

    if(index === -1) throw errors.MOVIE_NOT_FOUND(movieId)

    group.movies.splice(index, 1)

    return await updateGroup(groupId, group)
}
