// Module that contains the functions that handle all HTTP site requests



import errors from "../../errors.mjs";
import toHttpResponse from "../cmdb-response-errors.mjs";

function View(name,data){
    this.name = name
    this.data = data
}

export default function (services) {
    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }
    return {
        getMovie: handleRequest(getMovie),
        getMoviesTop:handleRequest(getMoviesTop),
        createGroupForm:createGroupForm,
        getGroups:handleRequest(getGroups) ,
        createGroup:handleRequest(createGroup),
        getGroup:handleRequest(getGroup),
        deleteGroup:handleRequest(deleteGroup),
        addMovie:handleRequest(addMovie),
        removeMovie:handleRequest(removeMovie)
    }
    async function getMovie(req, rsp) {
        let movies = await services.getMovies(req.query.title, req.query.limit)
        return new View('movie',{title:`movies`,movies:movies})
    }
    async function createGroupForm(req, rsp) {
        rsp.render('newGroup')
    }
    async function getMoviesTop(req, rsp) {
        let moviesTop = await services.getMoviesTop(req.query.limit)
        return new View('movies_top',{title:`List of movies Top`,moviesTop:moviesTop})
    }
    async function getGroups(req, rsp) {
        let groups = await services.getGroups(req.token)
        return new View('groups',{title:`Groups`,groups:groups})
    }
    async function getGroup(req, rsp) {
        let group = await services.getGroup(req.token,req.params.groupId)
        return new View('group',{title:`Group`,group:group})
    }
    async function createGroup(req, rsp) {
        let newGroup = await services.createGroup(req.token, {name:req.body.name,description:req.body.description})
        rsp.redirect(`/site/groups/${newGroup.id}`)
    }
    async function deleteGroup(req, rsp) {
        await services.deleteGroup(req.token)
        rsp.redirect(`/site/groups`)
    }
    async function addMovie(req, rsp) {
        let groups = await services.getGroups(req.token,req.params.groupId)
        rsp.render('groups',groups)
    }
    async function removeMovie(req, rsp) {
        let groups = await services.getGroups(req.token)
        rsp.render('groups',groups)
    }

    function handleRequest(handler) {
        return async function (req, rsp) {
            req.token = 'dac7dfa1-660e-4436-b487-8124ada49f91'
            try {
              let view = await handler(req, rsp)
                if (view){rsp.render(view.name,view.data)}
            } catch(e) {
                const response = toHttpResponse(e)
                rsp.status(response.status).json({ error: response.body })
            }
        }
    }
}