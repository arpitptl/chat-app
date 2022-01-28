const path = require('path')
const socketio = require('socket.io')
const http = require('http')
const express = require('express')

const app = express()

const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000


// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', () => {
    console.log("New Connection")
})

server.listen(port, () => {
    console.log("App is running on port: ", port)
})