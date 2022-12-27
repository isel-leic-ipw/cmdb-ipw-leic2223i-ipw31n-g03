// Module that contains the functions that handle all HTTP site requests
import errors from "../../errors.mjs";
import handleRequest from "../common/cmdb-handler.mjs"
import {  RENDER,REDIRECTED } from './cmdb-site-constants.mjs'

function View(name,data){
    this.name = name
    this.data = data
}

export default function (services) {
    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }
    return {
        getAddMovieForm:handleRequest(addMovieForm,RENDER,false),
        getMovie: handleRequest(getMovie,RENDER,false),
        searchMovieForm:handleRequest(searchMovieForm,RENDER,false),
        getMovies: handleRequest(getMovies,RENDER,false),
        getMoviesTop:handleRequest(getMoviesTop,RENDER,false),
        createGroupForm:handleRequest(createGroupForm,RENDER,false),
        getGroups:handleRequest(getGroups,RENDER,false) ,
        createGroup:handleRequest(createGroup,REDIRECTED,false),
        getGroup:handleRequest(getGroup,RENDER,false),
        deleteGroup:handleRequest(deleteGroup,REDIRECTED,false),
        updateGroup:handleRequest(updateGroup,REDIRECTED,false),
        updateGroupForm:handleRequest(updateGroupForm,RENDER,false),
        addMovie:handleRequest(addMovie,REDIRECTED,false),
        removeMovie:handleRequest(removeMovie,REDIRECTED,false),
        getMovieDetails:handleRequest(getMovieDetails,RENDER,false),
        verifyAuth:verifyAuth,
        validateLogin:validateLogin,
        logout:logout,
        loginForm:handleRequest(loginForm,RENDER,false),
        home:handleRequest(home,REDIRECTED,false),
        homeAuth:handleRequest(homeAuth,REDIRECTED,false),
    }
    function verifyAuth(req, rsp, next) {
        console.log("verifyAuthenticated", req.user)
        if(req.user) {
            console.log("$$$$$$$$$$$$$$$$$")
            return next()
        }
        console.log("#################")
        rsp.redirect('site/login')
    }
    function logout(req, rsp) {
        req.logout((err) => {
            rsp.redirect('./home')
        })

    }
    function home(req, rsp) {
        let user = req.user ? req.user.username : "unknown"
        if(user !== "unknown"){
            rsp.redirect('/site/auth/groups')
        }
        rsp.render('home',{title:`Home Page`,username:user})
    }
    function homeAuth(req, rsp) {
        console.log("homeAuthenticated - ", req.user)
        const user = req.user.username
        if (user) rsp.redirect(`/site/auth/groups`)
        else rsp.redirect(`/site/home`)
    }
    async function validateLogin(req, rsp) {
        console.log("validateLogin")
        let user_auth = await validateUser(req.body.username, req.body.password)
        if(user_auth) {
            const user = {
                id:user_auth.id,
                username: user_auth.username,
                groups: user_auth.groups,
                token: user_auth.token
            }
            console.log(user)
            req.login(user, () => rsp.redirect('./auth/home'))
        }
       async function validateUser(username, password) {
            return await services.getUser(username, password)
        }
    }
    async function addMovieForm(req, rsp){
        let movie = await services.getMovie(req.params.movieId)
        let groups = await services.getGroups(req.token)
        return new View('selectGroupForm',{title:`Select Group`,movie:movie,groups:groups})
    }
    async function searchMovieForm(req, rsp){
        return new View('searchMovieForm',{title:`Search Movies`})
    }
    async function getMovies(req, rsp) {
        let movies = await services.getMovies(req.query.title, req.query.limit)
        return new View('movies_top',{title:`Search Result List`,movies:movies})
    }
    async function getMovieDetails(req, rsp) {
        let movie = await services.getMovieDetails(req.token,req.params.groupId,req.params.movieId)
        return new View('movieDetails',{title:movie.title,movie:movie,groupId:req.params.groupId})
    }
    async function getMovie(req, rsp) {
        let movie = await services.getMovie(req.query.title, req.query.limit)
        return new View('moviesList',{title:'Movies List',movie:movie})
    }
    async function createGroupForm(req, rsp) {
       return new View('newGroup',{title:`New Group`,buttonText:'Create Group',action:`/site/groups`})
    }
    async function loginForm(req, rsp){
        let user = req.user
        return new View('login',{title:`Login`,user:user})
    }
    async function getMoviesTop(req, rsp) {
        let moviesTop = await services.getMoviesTop(req.query.limit)
        return new View('movies_top',{title:`List of movies Top`,movies:moviesTop})
    }
    async function getGroups(req, rsp) {
        let groups = await services.getGroups(req.token)
        return new View('groups',{title:`Groups`,groups:groups})
    }
    async function getGroup(req, rsp) {
        let group = await services.getGroup(req.token,req.params.groupId)
        return new View('group',{title:group.name,group:group})
    }
    async function createGroup(req, rsp) {
        await services.createGroup(req.token, {name:req.body.name,description:req.body.description})
        rsp.redirect(`/site/groups`)
    }
    async function updateGroup(req, rsp) {
        let editedGroup = await services.updateGroup(req.token,req.params.groupId, {name:req.body.name,description:req.body.description})
        rsp.redirect(`/site/auth/groups/${editedGroup.id}`)
    }
    async function updateGroupForm(req, rsp) {
        let group = await services.getGroup(req.token,req.params.groupId)
        return new View('newGroup',{title:`Update Group`,group:group,buttonText:'Update Group',action:`/site/auth/groups/${group.id}/update`})
    }
    async function deleteGroup(req, rsp) {
        await services.deleteGroup(req.token,req.params.groupId)
        rsp.redirect(`/site/groups`)
    }
    async function addMovie(req, rsp) {
        let group = await services.addMovie(req.token,Number(req.query.groupId),req.params.movieId)
        rsp.redirect(`/site/auth/groups/${group.id}`)
    }
    async function removeMovie(req, rsp) {
        let group = await services.removeMovie(req.token,Number(req.params.groupId),req.params.movieId)
        rsp.redirect(`/site/auth/groups/${group.id}`)
    }



}