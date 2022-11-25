// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from "express"
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'

import * as data from './data/imdb-movies-data.mjs'
import * as userData from './data/cmdb-data-mem.mjs'
import servicesInt from './services/cmdb-services.mjs'
import apiInit from './api/cmdb-web-api.mjs'

const swaggerDocument = yaml.load('./docs/cmdb-api.yaml')
const PORT = 1500

const api = apiInit(servicesInt(data, userData))

console.log("Start setting up server")
let app = express()

app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.json())


// Movies
app.get("/movies",api.getMovies)
app.get("/movies/top", api.getMoviesTop)
// Groups
app.get("/groups", api.getGroups)
app.post("/groups", api.createGroup)
// Group
app.get("/groups/:groupId", api.getGroup)
app.put("/groups/:groupId", api.updateGroup)
app.delete("/groups/:groupId", api.deleteGroup)
// Movie in Group
app.put("/groups/:groupId/:movieId", api.addMovie)
app.delete("/groups/:groupId/:movieId", api.removeMovie)
//Users
app.post("/users", api.createUser)

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))

console.log("End setting up server")