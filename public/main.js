//Initializing socket
const socket = io()

const authorSchema = new normalizr.schema.Entity('author', {}, { idAttribute: 'id' });

const messageSchema = new normalizr.schema.Entity('message', { author: authorSchema }, { idAttribute: '_id' })

const messagesSchema = new normalizr.schema.Entity('posts', { mensajes: [messageSchema] }, { idAttribute: 'id' })

//Functions to add messages and products by taking the value inserted in the inputs
const messageReceptor = () => {
    const message = {
        author: {
            email: document.querySelector('#inputEmail').value,
            nombre: document.querySelector('#firstName').value,
            apellido: document.querySelector('#lastName').value,
            edad: document.querySelector('#age').value,
            alias: document.querySelector('#alias').value,
            avatar: document.querySelector('#avatar').value
        },
        text: document.querySelector('#inputMessage').value
    }
    socket.emit('new_message', message)
    return false
}
const addProducts = () => {
    const title = document.querySelector('#inputTitle').value
    const price = document.querySelector('#inputPrice').value
    const thumbnail = document.querySelector('#inputThumbnail').value

    const product = {title, price, thumbnail}
    socket.emit('new_product', product)
    return false
}

//Function that creates html with those input values
const createHtml = (message) => {
    return (
        `
            <div>
                <b style="color:blue;">${message.author}</b>
                <sm style="color:brown;">[${message.timestamp}]</sm>:
                <i style="color:green;">${message.text}</i>
            </div>
        `
    )
}
const createColumn = (product) => {
    const {title, price, thumbnail} = product
    return (
        `
            <tr>               
                <td>${title}</td>
                <td>${price}</td>
                <td>
                    <img src=${thumbnail} alt="image of product" width="60px" height="60px">
                </td>
            </tr>
        `
    )
}

const renderMessages = (messages) => {

    for(let i = 1; i <= messages.entities.posts.messages.messages.length; i++) {
        createHtml(messages.entities.message[i])
        const messagesDiv = document.querySelector('#messages')
        if(messagesDiv) messagesDiv.innerHTML = createHtml(messages.entities.message[i])
    }
}
const renderProducts = (products) => {
    const html = products.map(product => createColumn(product)).join(' ')
    const table = document.querySelector('#table')
    if (table) table.innerHTML = html
}

socket.on('messages', (messages) => {
    const normalizedMessagesLength = JSON.stringify(messages).length
    console.log(messages, normalizedMessagesLength);

    const denormalizedMessages = normalizr.denormalize(messages.result, messagesSchema, messages.entities)

    const denormalizedMessagesLength = JSON.stringify(denormalizedMessages).length
    console.log(denormalizedMessages, denormalizedMessagesLength);

    const percentage = parseInt((denormalizedMessagesLength * 100) / normalizedMessagesLength)

    document.getElementById('percentage').innerText = percentage

    renderMessages(messages)
})
socket.on('products', (products) => {
    renderProducts(products)
})