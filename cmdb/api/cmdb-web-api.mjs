// Module that contains the functions that handle all HTTP API requests

import toHttpResponse from './cmdb-response-errors.mjs'
import { BEARER, AUTHORIZATION } from './cmdb-api-constants.mjs'
import errors from "../errors.mjs";

export default function (services) {
    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }
    return {
        getMoviesTop: handleRequest(getMoviesTopInternal),
        getMovies: handleRequest(getMoviesInternal),
        getGroup: handleRequestWithAuth(getGroupInternal),
        createGroup: handleRequestWithAuth(createGroupInternal),
        updateGroup: handleRequestWithAuth(updateGroupInternal),
        deleteGroup: handleRequestWithAuth(deleteGroupInternal),
        getGroups: handleRequestWithAuth(getGroupsInternal),
        addMovie: handleRequestWithAuth(addMovieInternal),
        removeMovie: handleRequestWithAuth(removeMovieInternal),
        createUser: handleRequest(createUserInternal)
    }

    async function getMoviesTopInternal(req, rsp) {
        let moviesTop = await services.getMoviesTop(req.query.limit)
        return {
            movies: moviesTop
        }
    }

    async function getMoviesInternal(req, rsp) {
        let movies = await services.getMovies(req.query.title, req.query.limit)
        return {
            movies: movies
        }
    }

    async function getGroupInternal(req, rsp) {
        let group =  await services.getGroup(req.token, req.params.groupId)
        return {
            group: group
        }
    }

    async function createGroupInternal(req, rsp) {
        let newGroup = await services.createGroup(req.token, req.body)
        rsp.status(201)
        return {
            status: `Group with id ${newGroup.id} created with success`,
            group: newGroup
        }
    }

    async function updateGroupInternal(req, rsp) {
        let group = await services.updateGroup(req.token, req.params.groupId, req.body)
        return {
            status: `Group with id ${group.id} updated with success`,
            group: group
        }
    }

    async function deleteGroupInternal(req, rsp) {
        let group = await services.deleteGroup(req.token, req.params.groupId)
        return {
            status: `Group with id ${group.id} deleted with success`,
            group: group
        }
    }

    async function getGroupsInternal(req, rsp) {
        let groups = await services.getGroups(req.token)
        return {
            groups: groups
        }
    }

    async function addMovieInternal(req, rsp) {
        let group = await services.addMovie(req.token, req.params.groupId, req.params.movieId)
        return{
            status: `Movie with id: ${req.params.movieId} added to group: ${group.id} with success`,
            group: group
        }
    }

    async function removeMovieInternal(req, rsp) {
        let group = await services.removeMovie(req.token, req.params.groupId, req.params.movieId)
        return{
            status: `Movie with id: ${req.params.movieId} removed from group: ${group.id} with success`,
            group: group
        }
    }

    async function createUserInternal(req, rsp) {
        let user = await services.createUser()
        rsp.status(201)
        return {
            status: `User with id ${user.id} created with success`,
            user: user
        }
    }

    function handleRequestWithAuth(handler) {
        return async function (req, rsp) {
            let tokenHeader = req.get(AUTHORIZATION)
            if (!(tokenHeader && tokenHeader.startsWith(BEARER) && tokenHeader.length > BEARER.length)) {
                rsp.status(401).json({
                    error: {
                        message: "Invalid or missing token"
                    }
                })
                return
            }
            req.token = tokenHeader.split(" ")[1]

            try {
                let body = await handler(req, rsp)
                rsp.json(body)
            } catch(e) {
                const response = toHttpResponse(e)
                rsp.status(response.status).json({ error: response.body })
            }
        }
    }

    function handleRequest(handler) {
        return async function (req, rsp) {
            try {
                let body = await handler(req, rsp)
                rsp.json(body)
            } catch(e) {
                const response = toHttpResponse(e)
                rsp.status(response.status).json({ error: response.body })
            }
        }
    }
}

