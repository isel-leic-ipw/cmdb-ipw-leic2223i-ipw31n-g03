import services from "../../services/cmdb-services.mjs";

    export async function getMoviesTopInternal(req, rsp) {
        return await services.getMoviesTop(req.query.limit)
    }

    export async function getMoviesInternal(req, rsp) {
        return await services.getMovies(req.query.title, req.query.limit)
    }

    export async function getGroupInternal(req, rsp) {
        return await services.getGroup(req.token, req.params.groupId)
    }

 export async function createGroupInternal(req, rsp) {
        let newGroup = await services.createGroup(req.token, req.body)
        rsp.status(201)
        return {
            status: `Group with id ${newGroup.id} created with success`,
            newGroup
        }
    }

export async function updateGroupInternal(req, rsp) {
        let group = await services.updateGroup(req.token, req.params.groupId, req.body)
        return {
            status: `Group with id ${group.id} updated with success`,
            group
        }
    }

export async function deleteGroupInternal(req, rsp) {
        let group = await services.deleteGroup(req.token, req.params.groupId)
        return {
            status: `Group with id ${group.id} deleted with success`,
            group: group
        }
    }

export async function getGroupsInternal(req, rsp) {
        return await services.getGroups(req.token)
        }

export async function addMovieInternal(req, rsp) {
        let group = await services.addMovie(req.token, req.params.groupId, req.params.movieId)
        return {
            status: `Movie with id: ${req.params.movieId} added to group: ${group.id} with success`,
            group: group
        }
    }

export async function removeMovieInternal(req, rsp) {
        let group = await services.removeMovie(req.token, req.params.groupId, req.params.movieId)
        return {
            status: `Movie with id: ${req.params.movieId} removed from group: ${group.id} with success`,
            group: group
        }
    }

export async function createUserInternal(req, rsp) {
        let user = await services.createUser()
        rsp.status(201)
        return {
            status: `User with id ${user.id} created with success`,
            user: user
        }
    }
