// Module that contains the functions that handle all HTTP APi requests

import * as CMDBdata from '../data/cmdb-data-mem.mjs'
import * as CMDBmoviesAPI from '../data/imdb-movies-data.mjs'
import { MAX_LIMIT, MIN_LIMIT } from "./cmdb-services-constants.mjs"
import errors from '../errors.mjs'

export async function getMoviesTop(limit = MAX_LIMIT) {
    limit = Number(limit)
    if (isNaN(limit) || limit > MAX_LIMIT || limit < MIN_LIMIT) {
        throw errors.INVALID_PARAMETER("limit", `Limit must be positive, less than ${MAX_LIMIT}`)
    }

    return CMDBmoviesAPI.getMoviesTop(limit)
}

export async function getMovies(q,limit = MAX_LIMIT) {
    limit = Number(limit)
    if (isNaN(limit) || limit > MAX_LIMIT || limit < MIN_LIMIT) {
        throw errors.INVALID_PARAMETER("limit", `Limit must be positive, less than ${MAX_LIMIT}`)
    }

    return CMDBmoviesAPI.getMovies(q,limit)
}

export async function getGroup(userToken, groupId) {
    const user = await CMDBdata.getUser(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND()
    }
    const group = await CMDBdata.getGroup(user.id, groupId)
    if(!group) {
        throw errors.GROUP_NOT_FOUND(groupId)
    }

    return group
}

export async function createGroup(userToken, groupRepresentation) {
    const user = await CMDBdata.getUser(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND()
    }
    if(!isValidString(groupRepresentation.name)) { //TODO check if description is optional
        throw errors.INVALID_PARAMETER('name')
    }

    return CMDBdata.createGroup(user.id, groupRepresentation)
}

export async function updateGroup(userToken, groupId, groupRepresentation) {
    const user = await CMDBdata.getUser(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND()
    }
    let group_id = Number(groupId)
    if (isNaN(group_id) || group_id === undefined ){
        throw errors.GROUP_NOT_FOUND()
    }
    if(!isValidString(groupRepresentation.name)) { //TODO check if description is optional
        throw errors.INVALID_PARAMETER('name')
    }

    return CMDBdata.updateGroup(user.id, group_id, groupRepresentation)
}

export async function deleteGroup(userToken, groupId) {
    const user = await CMDBdata.getUser(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND()
    }
    let group_id = Number(groupId)
    if (isNaN(group_id) || group_id === undefined ){
        throw errors.GROUP_NOT_FOUND()
    }
    return CMDBdata.deleteGroup(user.id, group_id)
}

export async function getGroups(userToken) {
    const user = await CMDBdata.getUser(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND()
    }

    return CMDBdata.getGroups(user.id)
}

export async function addMovie(userToken, groupId, movieId) {
    const user = await CMDBdata.getUser(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND()
    }
    let group_id = Number(groupId)
    if (isNaN(group_id) || group_id === undefined ){
        throw errors.GROUP_NOT_FOUND()
    }
    if(!isValidString(movieId)) {
        throw errors.INVALID_PARAMETER(movieId)
    }

    return CMDBdata.addMovie(user.id, group_id, movieId)
}

export async function removeMovie(userToken, groupId, movieId) {
    const user = await CMDBdata.getUser(userToken)
    if(!user) {
        throw errors.USER_NOT_FOUND()
    }
    let group_id = Number(groupId)
    if (isNaN(group_id) || group_id === undefined ){
        throw errors.GROUP_NOT_FOUND()
    }
    if(!isValidString(movieId)){throw errors.INVALID_PARAMETER(movieId)}


    return CMDBdata.removeMovie(user.id, group_id, movieId)
}

export async function createUser() {
    return await CMDBdata.createUser()
}

function isValidString(value) {
    return typeof value == 'string' && value != ""

}