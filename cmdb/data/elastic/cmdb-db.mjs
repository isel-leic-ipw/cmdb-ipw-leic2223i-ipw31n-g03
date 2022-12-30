import elasticHttpClient from "./elastic-http-client.mjs"
import uri from "./uri-manager.mjs";
import * as imdb from '../common/imdb-movies-data.mjs'
import crypto from "node:crypto";
import { DELETE, GET, GROUPS_IDX, POST, PUT, USERS_IDX } from "./cmdb-data-constants.mjs"
import errors from "../../errors.mjs";

export async function getUser(userToken) {
    const response = await elasticHttpClient(POST, uri(USERS_IDX).getAll(), {
        query: {
            match: {
                token: userToken
            }
        }
    })

    const hits = response["hits"]["hits"]

    if (hits.length === 0) {
        return undefined
    }

    const user = hits[0]["_source"]

    return {
        id: hits[0]["_id"],
        username: user.username,
        password: user.password,
        token: user.token
    }
}

export async function getUserWeb(username, password) {
    const response = await elasticHttpClient(POST, uri(USERS_IDX).getAll(),{
        query: {
            match: {
                username: username
            }
        }
    })

    const hits = response["hits"]["hits"]

    if (hits.length === 0) return undefined

    const hit = hits.find(hit => hit["_source"].password === password)

    if (!hit) return undefined

    const user = hit["_source"]

    return {
        id: hit["_id"],
        username: user.username,
        password: user.password,
        token: user.token,
        groups: user.groups
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
    const response = await elasticHttpClient(DELETE, uri(USERS_IDX).delete(userId))
    return response["result"]
}

export async function createUser() {
    const token = crypto.randomUUID()
    const response = await elasticHttpClient(POST, uri(USERS_IDX).create(), {
        token: token
    })

    if(response["result"] === "created") {
        return token
    }

    return undefined
}

export async function createUserWeb(username, password) {
    const user = {
        username: username,
        password: password,
        token: crypto.randomUUID()
    }
    const response = await elasticHttpClient(POST, uri(USERS_IDX).create(), user)

    if(response["result"] === "created") {
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
    const response = await elasticHttpClient(POST, uri(GROUPS_IDX).create(), groupRepresentation)

    if(response["result"] === "created") {
        return {
            id: response["_id"],
            name: groupRepresentation.name,
            description: groupRepresentation.description,
            movies: groupRepresentation.movies
        }
    }

    return undefined
}

export async function getGroups(user) {
    const response = await elasticHttpClient(POST, uri(GROUPS_IDX).getAll(), {
        query: {
            match: {
                user: user.id
            }
        }
    })

    const hits = response["hits"]["hits"]

    if (hits.length === 0) {
        return undefined
    }

    return hits.map(hit => {
        let group = hit["_source"]
        return {
            id: hit["_id"],
            name: group.name,
            description: group.description,
            movies: group.movies
        }
    })
}

export async function getGroup(groupId) {
    const response = await elasticHttpClient(GET, uri(GROUPS_IDX).get(groupId))

    if (!response["found"]) {
        return undefined
    }

    const group = response["_source"]

    return {
        id: response["_id"],
        user: group.user,
        name: group.name,
        description: group.description,
        totalDuration: group.movies.reduce((accumulator, currentValue) => accumulator + currentValue.duration,0),
        movies: group.movies
    }
}

export async function deleteGroup(groupId) {
    const group = await getGroup(groupId)
    const response = await elasticHttpClient(DELETE, uri(GROUPS_IDX).delete(groupId))

    if(response["result"] === "deleted") {
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

    const response = await elasticHttpClient(PUT, uri(GROUPS_IDX).update(groupId), {
        user: group.user,
        name: group.name,
        description: group.description,
        movies: group.movies
    })

    if(response["result"] === "updated") {
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
