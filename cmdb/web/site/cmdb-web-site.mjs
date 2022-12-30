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
        getAddMovieForm:handleRequest(addMovieForm,RENDER),
        getMovie: handleRequest(getMovie,RENDER),
        searchMovieForm:handleRequest(searchMovieForm,RENDER,false),
        getMovies: handleRequest(getMovies,RENDER,false),
        getMoviesTop:handleRequest(getMoviesTop,RENDER,false),
        createGroupForm:handleRequest(createGroupForm,RENDER),
        getGroups:handleRequest(getGroups ,RENDER),
        createGroup:handleRequest(createGroup,REDIRECTED),
        getGroup:handleRequest(getGroup,RENDER),
        deleteGroup:handleRequest(deleteGroup,REDIRECTED),
        updateGroup:handleRequest(updateGroup,REDIRECTED),
        updateGroupForm:handleRequest(updateGroupForm,RENDER),
        addMovie:handleRequest(addMovie,REDIRECTED),
        removeMovie:handleRequest(removeMovie,REDIRECTED),
        getMovieDetails:handleRequest(getMovieDetails,RENDER),
        validateLogin:validateLogin,
        createUserForm:handleRequest(createUserForm,RENDER,false),
        createUser:handleRequest(createUser,REDIRECTED,false),
        deleteUser:handleRequest(deleteUser,REDIRECTED),
        loginForm:handleRequest(loginForm,RENDER,false),
        home:handleRequest(home,REDIRECTED,false),
        homeAuth:handleRequest(homeAuth,REDIRECTED),
    }

    function createUserForm(req, rsp){
        return new View('login',{title:`Create Account`,action:'./createuser'})
    }
   async function createUser(req, rsp){
        let user = await services.createUserWeb(req.body.username, req.body.password)
        req.login(user, () => rsp.redirect('/site/auth/home'))
    }
    async function deleteUser(req, rsp){
        await services.deleteUser(req.token)
        req.logout((err) => {
            rsp.redirect('/site/home')
        })
    }
    function home(req, rsp) {
        let user = req.user ? req.user.username : "unknown"
        if(user !== "unknown"){
            rsp.redirect('/site/auth/home')
        }
        rsp.render('home',{title:`Home Page`,username:user})
    }
    function homeAuth(req, rsp) {
        console.log("homeAuthenticated - ", req.user)
        const user = req.user.username
        if (user){
            rsp.render('homeAuth',{title:'Home Page',user:req.user})
        }
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
            req.login(user, () => rsp.redirect('./auth/groups'))
        }
       async function validateUser(username, password) {
            return await services.getUser(username, password)
        }
    }
    async function addMovieForm(req, rsp){
        let movie = await services.getMovie(req.params.movieId)
        let groups = await services.getGroups(req.token)
        return new View('selectGroupForm',{title:`Select Group`,movie:movie,groups:groups,user:req.user})
    }
    async function searchMovieForm(req, rsp){
        return new View('searchMovieForm',{title:`Search Movies`,user:req.user})
    }
    async function getMovies(req, rsp) {
        let movies = await services.getMovies(req.query.title, req.query.limit)
        return new View('movies_top',{title:`Search Result List`,movies:movies,user:req.user})
    }
    async function getMovieDetails(req, rsp) {
        let movie = await services.getMovieDetails(req.token,req.params.groupId,req.params.movieId)
        return new View('movieDetails',{title:movie.title,movie:movie,groupId:req.params.groupId,user:req.user})
    }
    async function getMovie(req, rsp) {
        let movie = await services.getMovie(req.query.title, req.query.limit)
        return new View('moviesList',{title:'Movies List',movie:movie,user:req.user})
    }
    async function createGroupForm(req, rsp) {
       return new View('newGroup',{title:`New Group`,buttonText:'Create Group',action:`/site/auth/groups`,user:req.user})
    }
    async function loginForm(req, rsp){
        return new View('login',{title:`Login`,user:req.user,action:'/site/login'})
    }
    async function getMoviesTop(req, rsp) {
        let moviesTop = await services.getMoviesTop(req.query.limit)
        return new View('movies_top',{title:`List of movies Top`,movies:moviesTop,user:req.user})
    }
    async function getGroups(req, rsp) {
        let groups = await services.getGroups(req.token)
        return  new View('groups',{title:`Groups`,groups:groups,user:req.user})
    }
    async function getGroup(req, rsp) {
        let group = await services.getGroup(req.token,req.params.groupId)
        return new View('group',{title:group.name,group:group,user:req.user})
    }
    async function createGroup(req, rsp) {
        await services.createGroup(req.token, {name:req.body.name,description:req.body.description})
        rsp.redirect(`/site/auth/groups`)
    }
    async function updateGroup(req, rsp) {
        let editedGroup = await services.updateGroup(req.token,req.params.groupId, {name:req.body.name,description:req.body.description})
        rsp.redirect(`/site/auth/groups/${editedGroup.id}`)
    }
    async function updateGroupForm(req, rsp) {
        let group = await services.getGroup(req.token,req.params.groupId)
        return new View('newGroup',{title:`Update Group`,group:group,buttonText:'Update Group',action:`/site/auth/groups/${group.id}/update`,user:req.user})
    }
    async function deleteGroup(req, rsp) {
        await services.deleteGroup(req.token,req.params.groupId)
        rsp.redirect(`/site/auth/groups`)
    }
    async function addMovie(req, rsp) {
        let group = await services.addMovie(req.token, req.body.groupId, req.params.movieId)
        rsp.redirect(`/site/auth/groups/${group.id}`)
    }
    async function removeMovie(req, rsp) {
        let group = await services.removeMovie(req.token, req.params.groupId,req.params.movieId)
        rsp.redirect(`/site/auth/groups/${group.id}`)
    }



}