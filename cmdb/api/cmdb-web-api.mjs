// Module that contains the functions that handle all HTTP APi requests

import * as CMDBServices from '../services/cmdb-services.mjs'
import { BEARER, AUTHORIZATION } from './cmdb-api-constants.mjs'
import toHttpResponse from './cmdb-response-errors.mjs'

export let getMoviesTop = handleRequestWOTOkken(getMoviesTopInternal)
export let getMovies = handleRequestWOTOkken(getMoviesInternal)

export let getGroup = handleRequest(getGroupInternal)
export let createGroup = handleRequest(createGroupInternal)
export let updateGroup = handleRequest(updateGroupInternal)
export let deleteGroup = handleRequest(deleteGroupInternal)

export let getGroups = handleRequest(getGroupsInternal)
export let addMovie = handleRequest(addMovieInternal)
export let removeMovie = handleRequest(removeMovieInternal)

export let createUser = handleRequestWOTOkken(createUserInternal)

async function getMoviesTopInternal(req, rsp) {
    return await CMDBServices.getMoviesTop(req.query.limit)
}

async function getMoviesInternal(req, rsp) {
    return await CMDBServices.getMovies(req.query.q, req.query.limit)
}

async function getGroupInternal(req, rsp) {
    return await CMDBServices.getGroup(req.token, req.params.groupId)
}

async function createGroupInternal(req, rsp) {
    let newGroup = await CMDBServices.createGroup(req.token, req.body)
    rsp.status(201)
    return {
        status: `Group with id ${newGroup.id} created with success`,
        group: newGroup
    }
}

async function updateGroupInternal(req, rsp) {
    let group = await CMDBServices.updateGroup(req.token, req.params.groupId, req.body)
    return {
        status: `Group with id ${group.id} updated with success`,
        group: group
    }
}

async function deleteGroupInternal(req, rsp) {
    let group = await CMDBServices.deleteGroup(req.token, req.params.groupId)
    return {
        status: `Group with id ${group.id} deleted with success`,
        group: group
    }
}

async function getGroupsInternal(req, rsp) {
    return await CMDBServices.getGroups(req.token)
}

async function addMovieInternal(req, rsp) {
    let group = await CMDBServices.addMovie(req.token, req.params.groupId, req.params.movieId)
    return{
        status: `Movie with id:${req.params.movieId} added to group:${group.id} with success`,
        group:group
    }
}

export async function removeMovieInternal(req, rsp) {
    let group = await CMDBServices.removeMovie(req.token, req.params.groupId, req.params.movieId)
    return{
        status: `Movie with id:${req.params.movieId} removed from group:${group.id} with success`,
        group:group
    }
}

export async function createUserInternal(req, rsp) {
        let user = await CMDBServices.createUser()
    return {
        status: `User with id ${user.id} created with success`,
        user: user
    }
}

function handleRequest(handler) {
    return async function (req, rsp) {
        let tokenHeader = req.get(AUTHORIZATION)
         if (!(tokenHeader && tokenHeader.startsWith(BEARER)) && tokenHeader.length > BEARER.length) {
             rsp.status(401).json({ error: "Invalid token" })
             return
         }
         req.token = tokenHeader.split(" ")[1]

        try {
            let body = await handler(req, rsp)
            rsp.json(body)
        } catch(e) {
            const response = toHttpResponse(e)
            rsp.status(response.status).json({error: response.body})
        }
    }
}
function handleRequestWOTOkken(handler) {
    return async function (req, rsp) {
        try {
            let body = await handler(req, rsp)
            rsp.json(body)
        } catch(e) {
            const response = toHttpResponse(e)
            rsp.status(response.status).json({error: response.body})
        }
    }


}