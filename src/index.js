const path = require('path')
const socketio = require('socket.io')
const http = require('http')
const express = require('express')
const Filter = require('bad-words')
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const app = express()

const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000


// Define paths for Express config
const publicDirectoryPath = path.join(__dirname, '../public')

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {

    socket.on('join', ({
        username,
        room
    }, callback) => {
        const {
            error,
            user
        } = addUser({
            id: socket.id,
            username,
            room
        })

        console.log("USER: ", user, error)

        if (!user) {
            console.log("IN ERROR...", error)
            return callback(error)
        }
        console.log("AFTER ERROR BLOCK: ", user)
        socket.join(user.room)
        console.log("AFTER JOIN ROOM")
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} user has joined!!`))
        callback()
    })

    socket.on('message', (msg, callback) => {
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed!')
        }
        io.to('as').emit('message', generateMessage(msg))
        callback()
    })

    socket.on('send location', (coords, callback) => {
        io.emit('send location', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
        }

    })
})

server.listen(port, () => {
    console.log("App is running on port: ", port)
})