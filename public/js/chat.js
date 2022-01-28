const socket = io()

// Elements
const messageForm = document.querySelector("#message-form")
const messageFormInput = document.querySelector("#message-input")
const messageFormButton = document.querySelector("#send-message")
const messages = document.querySelector("#messages")
const sendLocationButton = document.querySelector('#send-location')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
var search = location.search.substring(1);
const {
    username,
    room
} = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')


messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    messageFormButton.setAttribute('disabled', 'disabled')

    if (messageFormInput.value) {
        socket.emit('message', messageFormInput.value, (error) => {
            messageFormButton.removeAttribute('disabled')
            messageFormInput.value = ''
            messageFormInput.focus()
            if (error) {
                return console.log(error)
            }
            console.log("Message is delivered!")
        })
    }
})

const autoScroll = () => {
    // New message element
    const newMessage = messages.lastElementChild

    // get the height of new message
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHt = newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHt = messages.offsetHeight

    // Height of messages container
    const containerHt = messages.scrollHeight

    //How fat have I scrolled
    const scrollOffset = messages.scrollTop + visibleHt

    if (containerHt - newMessageHt <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }

}

socket.on('message', (message) => {

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

sendLocationButton.addEventListener('click', () => {

    sendLocationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!!')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            sendLocationButton.removeAttribute('disabled')
            console.log("Location shared!")
        })
    })
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        location: message.url,
        createdAt: moment(message.createdAt).format("h:mm a")
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

socket.on('roomData', ({
    room,
    users
}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})