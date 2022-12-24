// Module that contains the functions that handle all HTTP site requests
import errors from "../../errors.mjs";
import toHttpResponse from "../cmdb-response-errors.mjs";
import handleRequest from "../common/cmdb-handler.mjs"
import {  RENDER,REDIRECTED } from './cmdb-site-constants.mjs'
import * as cmdbFunction from "../common/cmdb-common-function.mjs"

function View(name,data){
    this.name = name
    this.data = data
}

export default function (services) {
    if (!services) {
        throw errors.INVALID_PARAMETER('services')
    }
    return {
        getMovie: handleRequest(getMovie,RENDER,false),
        addMovieForm:handleRequest(addMovieForm,RENDER,false),
        getMovies: handleRequest(getMovies,RENDER,false),
        getMoviesTop:handleRequest(getMoviesTop,RENDER,false),
        createGroupForm:handleRequest(createGroupForm,RENDER,false),
        getGroups:handleRequest(getGroups,RENDER,false) ,
        createGroup:handleRequest(createGroup,REDIRECTED,false),
        getGroup:handleRequest(getGroup,RENDER,false),
        deleteGroup:handleRequest(deleteGroup,REDIRECTED,false),
        updateGroup:handleRequest(updateGroup,REDIRECTED,false),
        updateGroupForm:handleRequest(updateGroupForm,RENDER,false),
        addMovie:handleRequest(addMovie,RENDER,false),
        removeMovie:handleRequest(removeMovie,RENDER,false),
        verifyAuth:verifyAuth,
        validateLogin:validateLogin,
        logout:logout,
        loginForm:handleRequest(loginForm,RENDER,false),
        home:handleRequest(home,RENDER,false),
        homeAuth:homeAuth
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
            rsp.redirect('site/home')
        })
    }
    function home(req, rsp) {
        let user = req.user ? req.user.username : "unknown"
        if(user !== "unknown"){
            return  getGroups(req, rsp)
        }
        return new View('home',{title:`Home Page`,username:user})
    }
    function homeAuth(req, rsp) {
        console.log("homeAuthenticated - ", req.user)
        const user = req.user.username
        if (user) rsp.redirect(`/site/auth/groups`)
        else rsp.redirect(`/site/home`)
    }
    function validateLogin(req, rsp) {
        console.log("validateLogin")
        if(validateUser(req.body.username, req.body.password)) {
            const user = {
                username: req.body.username,
                dummy: "dummy property on user"
            }
            console.log(user)
            req.login(user, () => rsp.redirect('./auth/home'))
        }
        function validateUser(username, password) { return true }
    }

    async function addMovieForm(req, rsp){

    }
    async function getMovies(req, rsp) {
        let movies = await services.getMovies(req.query.title, req.query.limit)
        return new View('moviesList',{title:`Movies List`,movies:movies})
    }
    async function getMovie(req, rsp) {
        let movie = await services.getMovies(req.query.title, req.query.limit)
        return new View('moviesList',{title:`Movies List`,movie:movie})
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
        return new View('group',{title:`Group`,group:group})
    }
    async function createGroup(req, rsp) {
        await services.createGroup(req.token, {name:req.body.name,description:req.body.description})
        rsp.redirect(`/site/groups`)
    }
    async function updateGroup(req, rsp) {
        let editedGroup = await services.updateGroup(req.token,req.params.groupId, {name:req.body.name,description:req.body.description})
        rsp.redirect(`/site/groups/${editedGroup.id}`)
    }
    async function updateGroupForm(req, rsp) {
        let group = await services.getGroup(req.token,req.params.groupId)
        return new View('newGroup',{title:`Update Group`,group:group,buttonText:'Update Group',action:`/site/groups/${group.id}/update`})
    }
    async function deleteGroup(req, rsp) {
        await services.deleteGroup(req.token,req.params.groupId)
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



}