//Initializing socket
const socket = io()

//Functions to add messages and products by taking the value inserted in the inputs
const messageReceptor = () => {
    const userEmail = document.querySelector('#inputEmail').value
    const userText = document.querySelector('#inputMessage').value
    const date = new Date()
    const fullDate = `${date.getDate() < 10 ? '0' + (date.getDate() + 1) : (date.getDate() + 1)}/${date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()}/${date.getFullYear()} ${date.getHours() < 10 ? '0' + (date.getHours()) : (date.getHours())}:${date.getMinutes() < 10 ? '0' + (date.getMinutes()) : (date.getMinutes())}:${date.getSeconds() < 10 ? '0' + (date.getSeconds()) : (date.getSeconds())}`
    const message = {userEmail, userText, fullDate}
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
    const { userEmail, userText, fullDate} = message
    return (
        `
            <div>
                <strong style="color:blue;">${userEmail}</strong>
                <sm style="color:brown;">[${fullDate}]</sm>:
                <em style="color:green;">${userText}</em>
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

//Function that uses the html to render onto the screen the values
const renderMessages = (messages) => {
    const html = messages.map(message => createHtml(message)).join(' ')
    const messagesDiv = document.querySelector('#messages')
    if(messagesDiv) messagesDiv.innerHTML = html
}
const renderProducts = (products) => {
    const html = products.map(product => createColumn(product)).join(' ')
    const table = document.querySelector('#table')
    if (table) table.innerHTML = html
}

//responding to the sockets event
socket.on('messages', (messages) => {
    renderMessages(messages)
})
socket.on('products', (products) => {
    renderProducts(products)
})