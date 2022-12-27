// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from "express"
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'
import url from "url";
import hbs from "hbs";
import path from 'path'
import morgan from 'morgan'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import fileStore from 'session-file-store'

import * as data from './data/common/imdb-movies-data.mjs'
import * as userData from './data/mem/cmdb-data-mem.mjs'
import servicesInit from './services/cmdb-services.mjs'
import apiInit from './web/api/cmdb-web-api.mjs'
import siteInit from './web/site/cmdb-web-site.mjs'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


const swaggerDocument = yaml.load('./docs/cmdb-api.yaml')
const PORT = 1500
const apiPrefix="/api"
const sitePrefix="/site"

const api = apiInit(servicesInit(data, userData))
const site = siteInit(servicesInit(data, userData))

console.log("Start setting up server")
let app = express()
app.use(cookieParser())
app.use(cors())
app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.json())
app.use(express.urlencoded())
const FileStore = fileStore(session)
app.use(session({
    secret:'group 03 nota -> 20',
    resave:false,
    saveUninitialized:false,
    store: new FileStore()
}))
app.use(passport.session())
app.use(passport.initialize())
passport.serializeUser(serializeUserDeserializeUser)
passport.deserializeUser(serializeUserDeserializeUser)
//View engine setup
const viewsPath = path.join(__dirname,'web','site','views' )
app.set('view engine','hbs')
app.set('views',viewsPath)
hbs.registerPartials(path.join(viewsPath,'partials'))


//Web API Routes
// Movies
app.get(`${apiPrefix}/movies`,api.getMovies)
app.get(`${apiPrefix}/movies/top`, api.getMoviesTop)
// Groups
app.get(`${apiPrefix}/groups`, api.getGroups)
app.post(`${apiPrefix}/groups`, api.createGroup)
// Group
app.get(`${apiPrefix}/groups/:groupId`, api.getGroup)
app.put(`${apiPrefix}/groups/:groupId`, api.updateGroup)
app.delete(`${apiPrefix}/groups/:groupId`, api.deleteGroup)
// Movie in Group
app.put(`${apiPrefix}/groups/:groupId/:movieId`, api.addMovie)
app.delete(`${apiPrefix}/groups/:groupId/:movieId`, api.removeMovie)
//Users
app.post(`${apiPrefix}/users`, api.createUser)

//WebSite Routes
//get static file
console.log(__dirname)
app.use(`${sitePrefix}/files`,express.static(`${__dirname}./static-files`,{redirect:false}))
//Movies
app.get(`${sitePrefix}/auth/movies/search`,site.searchMovieForm)
app.get(`${sitePrefix}/movies`,site.getMovies)
app.get(`${sitePrefix}/movies/top`,site.getMoviesTop)
//Group
app.get(`${sitePrefix}/auth/groups/new`,site.createGroupForm)
app.post(`${sitePrefix}/auth/groups/:groupId/del`,site.deleteGroup)
app.post(`${sitePrefix}/auth/groups/:groupId/update`,site.updateGroup)
app.get(`${sitePrefix}/auth/groups/:groupId/update`,site.updateGroupForm)
app.get(`${sitePrefix}/auth/groups/:groupId`,site.getGroup)
// Movie in Group
app.get(`${sitePrefix}/auth/groups/:groupId/:movieId`,site.getMovieDetails)
app.get(`${sitePrefix}/auth/movies/:movieId`,site.getAddMovieForm)
app.get(`${sitePrefix}/auth/movies/:movieId/add`,site.addMovie)
app.post(`${sitePrefix}/auth/groups/:groupId/:movieId/del`,site.removeMovie)
//Groups
app.get(`${sitePrefix}/auth/groups`,site.getGroups)
app.post(`${sitePrefix}/auth/groups`,site.createGroup)
//Non-Authenticated
app.use(`${sitePrefix}/auth`,site.verifyAuth)
app.get(`${sitePrefix}/home`,site.home)
//Authentication
app.get(`${sitePrefix}/login`,site.loginForm)
app.get(`${sitePrefix}/auth/home`,site.homeAuth)
app.post(`${sitePrefix}/login`,site.validateLogin)
app.post(`${sitePrefix}/logout`,site.logout)


app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))
function serializeUserDeserializeUser (user, done) {
    done(null, user)
}
console.log("End setting up server")