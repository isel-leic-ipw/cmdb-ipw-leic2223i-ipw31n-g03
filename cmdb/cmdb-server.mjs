// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from "express"
import * as api from "./cmdb-web-api.mjs"

const PORT = 1500

console.log("setting up server")
let app = express()

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