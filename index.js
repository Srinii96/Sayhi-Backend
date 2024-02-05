require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")
const http = require("http")
const { Server } = require("socket.io")

const PORT = process.env.PORT || 3669

const app = express()

const configureDB = require("./config/database")
const router = require("./config/routes")
configureDB()

const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL, methods: ["POST", "GET", "PUT"] }
})
require("./config/socketConfig")(io)

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

const staticpath = path.join(__dirname, "/public")
app.use("/public", express.static(staticpath))

app.use("/api", router)

server.listen(PORT, ()=>{
    console.log("Express server running on port -", PORT)
})