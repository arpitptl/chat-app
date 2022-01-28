const path = require('path')
const socketio = require('socket.io')
const http = require('http')
const express = require('express')
const Filter = require('bad-words')
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')

const app = express()

const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000


// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    socket.broadcast.emit('user message', generateMessage("New user has joined!!"))

    socket.on('chat message', (msg, callback) => {
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }
        io.emit('chat message', generateMessage(msg))
        callback()
    })

    socket.on('send location', (coords, callback) => {
        io.emit('send location', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('user message', generateMessage("A user has left"))
    })
})

server.listen(port, () => {
    console.log("App is running on port: ", port)
})