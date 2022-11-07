// Application Entry Point.
// Register all HTTP API routes and starts the server

import express from "express"
import * as api from "./cmdb-web-api.mjs"

const PORT = 1500

console.log("setting up server")
let app = express()

app.use(express.json())
//List
app.get("/list/:max",api.listMovies)
//Search
app.get("/search/:movie/:max",api.searchMovie)
//Groups
app.post("/groups/create",api.createGroup)
app.put("/groups/edit/:group_id",api.editGroup)
app.get("/groups/list",api.listGroups)
app.delete("/groups/delete/:group_id",api.deleteGroup)
app.get("/groups/details/:group_id",api.groupDetails)
app.put("/groups/add/:group_id",api.addMovie)
app.put("/groups/remove/:group_id",api.removeMovie)
//Users
app.post("/user/create",api.createUser)