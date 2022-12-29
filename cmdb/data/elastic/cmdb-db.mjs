import elasticHttpClient from "./elastic-http-client.mjs"
import uri from "./uri-manager.mjs";
import * as imdb from '../common/imdb-movies-data.mjs'
import crypto from "node:crypto";
import {GET, POST, PUT, DELETE, USERS_IDX, GROUPS_IDX, MOVIES_IDX} from "./cmdb-data-constants.mjs"

export async function getUser(userToken) {
    await elasticHttpClient(GET, uri(USERS_IDX).getAll(), {
        query: {
            match: {
                userToken: userToken
            }
        }
    })
}

export async function getUserWeb(username, password) {
    await elasticHttpClient(GET, uri(USERS_IDX).getAll(),{
        query: {
            match: {
                username: username,
                password: password
            }
        }
    })
}

export async function getMovieDetails(movieId) {
    await elasticHttpClient(GET, uri(MOVIES_IDX).get(movieId))
}

export async function removeUser(userId) {
    await elasticHttpClient(DELETE, uri(USERS_IDX).delete(userId))
}

export async function createUser() {
    await elasticHttpClient(POST, uri(USERS_IDX).create(), {
        userToken: crypto.randomUUID()
    })
}

export async function createUserWeb(username, password) {
    await elasticHttpClient(POST, uri(USERS_IDX).create(), {
        username: username,
        password: password,
        userToken: crypto.randomUUID()
    })
}

export async function createGroup(user, groupRepresentation) {
    groupRepresentation.user = user.id
    let group = await elasticHttpClient(POST, uri(GROUPS_IDX).create(), groupRepresentation)
    user.groups.push(group.id)

    await elasticHttpClient(PUT, uri(USERS_IDX).update(user.id), user)
}

export async function getGroups(user) {
    await elasticHttpClient(GET, uri(GROUPS_IDX).getAll(), {
        query: {
            match: {
                user: user.id
            }
        }
    })
}

export async function getGroup(groupId) {
    await elasticHttpClient(GET, uri(GROUPS_IDX).get(groupId))
}

export async function deleteGroup(user, groupId) {
    let index = user.groups.findIndex(group => group.id === groupId)
    user.groups.splice(index, 1)
    await elasticHttpClient(PUT, uri(USERS_IDX).update(user.id), user)
    await elasticHttpClient(DELETE, uri(GROUPS_IDX).delete(groupId))
}

export async function updateGroup(groupId, groupRepresentation) {
    let group = await getGroup(groupId)
    group.name = groupRepresentation.name
    if (!groupRepresentation.description) {
        group.description = groupRepresentation.description
    }
    await elasticHttpClient(PUT, uri(GROUPS_IDX).update(groupId), group)
}

export async function addMovie(groupId, movieId) {
    let movieImdb = await imdb.getMovie(movieId)
    let group = await getGroup(groupId)
    let movie = await elasticHttpClient(POST, uri(MOVIES_IDX).create(), movieImdb)

    group.movies.push(movie.id)

    await elasticHttpClient(PUT, uri(GROUPS_IDX).update(groupId), group)
}

export async function removeMovie(groupId, movieId) {
    let group = await getGroup(groupId)
    let index = group.movies.findIndex(movie => movie.id === movieId)
    group.movies.splice(index, 1)

    await elasticHttpClient(PUT, uri(GROUPS_IDX).update(groupId), group)
    await elasticHttpClient(DELETE, uri(MOVIES_IDX).delete(movieId))
}
