const socket = io()

const messageForm = document.querySelector("#form")
const messageFormInput = document.querySelector("#input")
const messageFormButton = document.querySelector("#send-message")
const messages = document.querySelector("#messages")
const sendLocationButton = document.querySelector('#send-location')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

form.addEventListener('submit', (e) => {
    e.preventDefault()

    messageFormButton.setAttribute('disabled', 'disabled')

    if (messageFormInput.value) {
        socket.emit('chat message', messageFormInput.value, (error) => {
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

socket.on('chat message', (msg) => {

    const html = Mustache.render(messageTemplate, {
        message: msg
    })
    messages.insertAdjacentHTML('beforeend', html)
    // const item = document.createElement('li')
    // item.textContent = msg
    // messages.appendChild(item)
    // window.scrollTo(0, document.body.scrollHeight)
})

socket.on('user message', (msg) => {
    const item = document.createElement('li')
    item.textContent = msg
    messages.append(item)
    // window.scrollTo(0, document.body.scrollHeight)
})

sendLocationButton.addEventListener('click', () => {

    sendLocationButton.setAttribute('disabled', 'disabled')
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser!!')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords.latitude)
        console.log(position.coords.longitude)
        socket.emit('send location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            sendLocationButton.removeAttribute('disabled')
            console.log("Location shared!")
        })
    })
})

socket.on('send location', (location) => {
    const html = Mustache.render(locationTemplate, {
        location
    })
    messages.insertAdjacentHTML('beforeend', html)
    // const item = document.createElement('a')
    // item.textContent = msg
    // messages.append(item)
})