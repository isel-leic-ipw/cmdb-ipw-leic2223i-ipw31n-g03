// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from "express"
import * as api from "./cmdb-web-api.mjs"
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import cors from 'cors'

const swaggerDocument = yaml.load('C:\\Users\\d4nfo\\IdeaProjects\\cmdb-ipw-leic2223i-ipw31n-g03\\cmdb\\docs\\cmdb-api.yaml')
const PORT = 1500

console.log("Start setting up server")
let app = express()

app.use(cors())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(express.json())


// Top Movies
app.get("/movies/top", api.listMovies)
// Search Movie by Name
app.get("/movies/search/:movie_name/",api.searchMovie)
// Groups
app.get("/groups", api.listGroups)
app.post("/groups", api.createGroup)
// Group
app.get("/groups/:group_id", api.groupDetails)
app.put("/groups/:group_id", api.editGroup)
app.delete("/groups/:group_id", api.deleteGroup)
// Movie in Group
app.put("/groups/:group_id/:movie_id", api.addMovie)
app.delete("/groups/:group_id/:movie_id", api.removeMovie)
//Users
app.get("/users", api.getUsers)
app.post("/users", api.createUser)

app.listen(PORT, () => console.log(`Server listening in http://localhost:${PORT}`))