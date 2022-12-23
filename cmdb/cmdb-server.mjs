// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from "express"
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'
import path from 'path'

import * as data from './data/imdb-movies-data.mjs'
import * as userData from './data/cmdb-data-mem.mjs'
import servicesInit from './services/cmdb-services.mjs'
import apiInit from './web/api/cmdb-web-api.mjs'
import siteInit from './web/site/cmdb-web-site.mjs'
import url from "url";
import hbs from "hbs";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


const swaggerDocument = yaml.load('./docs/cmdb-api.yaml')
const PORT = 1500
const apiPrefix="/api"
const sitePrefix="/site"

const api = apiInit(servicesInit(data, userData))
const site = siteInit(servicesInit(data, userData))

console.log("Start setting up server")
let app = express()
//View engine setup
const viewsPath = path.join(__dirname,'web','site','views' )
app.set('view engine','hbs')
app.set('views',viewsPath)
hbs.registerPartials(path.join(viewsPath,'partials'))

app.use(cors())
app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.json())
app.use(express.urlencoded())

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
app.use(`${sitePrefix}/files`,express.static(`${__dirname}./static-files`,{redirect:false}))
//Movies
app.get(`${sitePrefix}/movies`,site.getMovie)
app.get(`${sitePrefix}/movies/top`,site.getMoviesTop)
//Group
app.get(`${sitePrefix}/groups/new`,site.createGroupForm)
app.post(`${sitePrefix}/groups/:groupId/del`,site.deleteGroup)
app.get(`${sitePrefix}/groups/:groupId`,site.getGroup)
// Movie in Group
app.post(`${sitePrefix}/groups/:groupId/:movieId/add`,site.addMovie)
app.post(`${sitePrefix}/groups/:groupId/:movieId/del`,site.removeMovie)
//Groups
app.get(`${sitePrefix}/groups`,site.getGroups)
app.post(`${sitePrefix}/groups`,site.createGroup)


app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")