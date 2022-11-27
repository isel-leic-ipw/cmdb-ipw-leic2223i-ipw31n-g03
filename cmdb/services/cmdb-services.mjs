// Module that implements all the management logic

import { MAX_LIMIT, MIN_LIMIT } from "./cmdb-services-constants.mjs"
import errors from '../errors.mjs'

export default function (data, userData) {
    // Validate arguments
    if (!data) {
        throw errors.INVALID_PARAMETER('data')
    }
    if (!userData) {
        throw errors.INVALID_PARAMETER('usersData')
    }

    return {
        getMoviesTop: getMoviesTop,
        getMovies: getMovies,
        getGroup: handleToken(getGroup),
        createGroup: handleToken(createGroup),
        updateGroup: handleToken(updateGroup),
        deleteGroup: handleToken(deleteGroup),
        getGroups: handleToken(getGroups),
        addMovie: handleToken(addMovie),
        removeMovie: handleToken(removeMovie),
        createUser: createUser,
    }

    async function getMoviesTop(limit = MAX_LIMIT) {
        limit = checkValidNumber(limit,"limit")
        if (limit > MAX_LIMIT || limit < MIN_LIMIT) {
            throw errors.INVALID_PARAMETER("limit", `Limit must be positive, less than ${MAX_LIMIT}`)
        }
        return data.getMoviesTop(limit)
    }

    async function getMovies(title, limit = MAX_LIMIT) {
        limit = checkValidNumber(limit,"limit")
        title = checkValidString(title,"title",`tittle must not be empty`)
        if (limit > MAX_LIMIT || limit < MIN_LIMIT) {
            throw errors.INVALID_PARAMETER("limit", `Limit must be positive, less than ${MAX_LIMIT}`)
        }
        return data.getMovies(title, limit)
    }

    async function getGroup(user, groupId) {
        groupId = checkValidNumber(groupId,"groupId")
        const group = await userData.getGroup(user.id, groupId)
        if(!group) {
            throw errors.GROUP_NOT_FOUND(groupId)
        }

        return group
    }

    async function createGroup(user, groupRepresentation) {
        groupRepresentation.name = checkValidString(groupRepresentation.name,'name')
        return userData.createGroup(user.id, groupRepresentation)
    }

    async function updateGroup(user, groupId, groupRepresentation) {
        groupId = checkValidNumber(groupId,"groupId")
        groupRepresentation.name = checkValidString(groupRepresentation.name,'name')
        const group = await userData.updateGroup(user.id, groupId, groupRepresentation)
        if(!group) {
            throw errors.GROUP_NOT_FOUND(groupId)
        }

        return group
    }

    async function deleteGroup(user, groupId) {
        groupId = checkValidNumber(groupId,"groupId")
        const group = await userData.deleteGroup(user.id, groupId)
        if(!group) {
            throw errors.GROUP_NOT_FOUND(groupId)
        }

        return group
    }

    async function getGroups(user) {
        return userData.getGroups(user.id)
    }

    async function addMovie(user, groupId, movieId) {
        groupId = checkValidNumber(groupId,"groupId")
        movieId = checkValidString(movieId,"movieId")
        const group = await userData.addMovie(user.id, groupId, movieId)
        if(!group) {
            throw errors.GROUP_NOT_FOUND(groupId)
        }

        return group
    }

    async function removeMovie(user, groupId, movieId) {
        groupId = checkValidNumber(groupId,"groupId")
        movieId = checkValidString(movieId,"movieId")
        const group = await userData.removeMovie(user.id, groupId, movieId)
        if(!group) {
            throw errors.GROUP_NOT_FOUND(groupId)
        }
    return group
}

    async function createUser() {
        return await userData.createUser()
    }

    function handleToken(handler) {
        return async function (userToken, ...args) {
            const user = await userData.getUser(userToken)
            if(!user) {
                throw errors.USER_NOT_FOUND()
            }
            return handler(user, ...args)
        }
    }

    function checkValidString(value,arg_name,description) {
        if( typeof value == 'string' && value != ""){
            return value
        }else{
            throw errors.INVALID_PARAMETER(arg_name,description)
        }
    }
    function checkValidNumber(value,arg_name,description){
        value = Number(value)
        if (isNaN(value) || !value){
            throw errors.INVALID_PARAMETER(arg_name,description)
        }else return value
    }
}

