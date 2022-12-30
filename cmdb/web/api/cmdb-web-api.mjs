// Module that contains the functions that handle all HTTP site requests
import { JSON } from './cmdb-api-constants.mjs'
import errors from "../../errors.mjs";
import handleRequest from "../common/cmdb-handler.mjs"


export default function (services) {
    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }
    return {
        getMoviesTop: handleRequest(getMoviesTop,JSON,false),
        getMovies: handleRequest(getMovies,JSON,false),
        getGroup: handleRequest(getGroup,JSON),
        createGroup: handleRequest(createGroup,JSON),
        updateGroup: handleRequest(updateGroup,JSON),
        deleteGroup: handleRequest(deleteGroup,JSON),
        getGroups: handleRequest(getGroups,JSON),
        addMovie: handleRequest(addMovie,JSON),
        removeMovie: handleRequest(removeMovie,JSON),
        createUser: handleRequest(createUser,JSON,false)
    }

    async function getMoviesTop(req, rsp) {
        let moviesTop = await services.getMoviesTop(req.query.limit)
        return {
            movies: moviesTop
        }
    }

    async function getMovies(req, rsp) {
        let movies = await services.getMovies(req.query.title, req.query.limit)
        return {
            movies: movies
        }
    }

    async function getGroup(req, rsp) {
        let group =  await services.getGroup(req.token, req.params.groupId)
        return {
            group: group
        }
    }

    async function createGroup(req, rsp) {
        let newGroup = await services.createGroup(req.token, req.body)
        rsp.status(201)
        return {
            status: `Group with id ${newGroup.id} created with success`,
            group: newGroup
        }
    }

    async function updateGroup(req, rsp) {
        let group = await services.updateGroup(req.token, req.params.groupId, req.body)
        return {
            status: `Group with id ${group.id} updated with success`,
            group: group
        }
    }

    async function deleteGroup(req, rsp) {
        let group = await services.deleteGroup(req.token, req.params.groupId)
        return {
            status: `Group with id ${group.id} deleted with success`,
            group: group
        }
    }

    async function getGroups(req, rsp) {
        let groups = await services.getGroups(req.token)
        return {
            groups: groups
        }
    }

    async function addMovie(req, rsp) {
        let group = await services.addMovie(req.token, req.params.groupId, req.params.movieId)
        return{
            status: `Movie with id: ${req.params.movieId} added to group: ${group.id} with success`,
            group: group
        }
    }

    async function removeMovie(req, rsp) {
        let group = await services.removeMovie(req.token, req.params.groupId, req.params.movieId)
        return{
            status: `Movie with id: ${req.params.movieId} removed from group: ${group.id} with success`,
            group: group
        }
    }

    async function createUser(req, rsp) {
        let token = await services.createUser()
        rsp.status(201)
        return {
            status: `User was created with success`,
            token: token
        }
    }
}

