
import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import express from 'express'
import { engine } from 'express-handlebars'
import { faker } from '@faker-js/faker'
import { schema, normalize } from 'normalizr'
import { FirebaseContainer } from './src/containers/firebaseContainer.js'

const app = express()
app.use(express.static('public'))

const httpServer = new HttpServer(app)
const socketServer = new SocketServer(httpServer)

app.engine('handlebars', engine())
app.set('views', './hbs_views')
app.set('view engine', 'handlebars')

/* 
const mysqlOptions = {
    host: '127.0.0.1',
    user: 'root',
    password: 'amorfoda70',
    database: 'business'
}

const sqliteOptions = {
    filename: './db/messages.sqlite'
}

const mysqlKnex = {
    client: 'mysql2',
    connection: mysqlOptions
}

const sqlite3Knex = {
    client: 'sqlite3',
    connection: sqliteOptions,
    useNullAsDefault: true
} */

const createProductsArray = (num) => {
    const productsArray = []
    for (let i = 1; i <= num; i++) {
        const product = createFakeProduct(i)
        productsArray.push(product)
    }
    return productsArray
}

const createFakeProduct = (id) => {
    const product = {
        id: id,
        title: faker.commerce.product(),
        price: faker.commerce.price(),
        thumbnail: `${faker.image.business()}?${id}`
    }
    return product
}

const authorSchema = new schema.Entity('author', {}, { idAttribute: 'email' });

const messageSchema = new schema.Entity('message', { author: authorSchema }, { idAttribute: 'id' })

const messagesSchema = new schema.Entity('posts', { messages: [messageSchema] }, { idAttribute: 'id' })

const messagesNormalized = (messages) => normalize({ id: 'messages', messages: messages }, messagesSchema)

const messagesDb = new FirebaseContainer('messages')

let productsArray = createProductsArray(5)
//Get to /products that sends the array and renders it
app.get('/products', async(req, res) => {
    res.render('home', {products: productsArray})
})

//Setting the connection socket event later to be called in the main.js file with the information
socketServer.on('connection', async(socket) => {
    const messages = await messagesDb.getAll()
    const products = productsArray

    socket.emit('messages', messagesNormalized(messages))
    socket.emit('products', products)

    //On new_"X" event, i'll first push to the array the new info, write it in the txt file so that it lasts in memory and emit it globally.
    socket.on('new_message', (message) => {
        messagesDb.save(message)
        socketServer.sockets.emit('messages', messagesNormalized(messages))
    })
}) 

//Listening to the server but with http this time
const server = httpServer.listen(8080, () => console.log(`Server active at port: ${server.address().port}`))

/* [{"title":"a8f7820c-b44e-4699-a370-c9df82e08620","products":[{"title":"Calculator","price":100,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-256.png","stock":100,"description":"A device that performs arithmetic operations on numbers. It can do from addition, subtraction, multiplication, and division to more sophisticated operations such as can handle exponential operations, roots, logarithms, etc.","timestamp":"05/05/2022 08:16:26","id":1},{"title":"Board","price":300,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/board-math-class-school-256.png","stock":100,"description":"Is a reusable writing surface on which texts and figures are drawn with chalk or other types of erasable markers. ","timestamp":"05/05/2022 08:16:26","id":2}],"timestamp":"05/05/2022 08:16:26","id":1},{"title":"e542e8ca-3e2a-4858-ba39-f609aa2160ce","products":[{"title":"Pencil","price":20,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png","stock":100,"description":"A writing or drawing implement with a solid pigment core encased in a sleeve, barrel, or shaft that prevents breaking the core or marking a user's hand.","timestamp":"05/05/2022 08:16:26","id":1},{"title":"Note pad","price":70,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/paper-clip-academic-note-exam-256.png","stock":100,"description":"A book or stack of paper pages that are often ruled and used for purposes such as recording notes or memoranda, other writing, drawing or scrapbooking.","timestamp":"05/05/2022 08:16:26","id":2}],"timestamp":"05/05/2022 08:16:26","id":2},{"title":"a33519be-7916-4c9c-ade8-fe87b018c0ae","products":[{"title":"Backpack","price":250,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/bag-pack-container-school-256.png","stock":100,"description":"A bag put on somebody's back. It has two straps that go over the shoulders. It is used to carry things in it, and it often has many pockets or compartments to carry things.","timestamp":"05/05/2022 08:16:26","id":1},{"title":"Ruler","price":40,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png","stock":100,"description":"A tool or device used to measure length and draw straight lines. A ruler is used to measure the length in both metric and customary units. The rulers are marked with standard distance in centimeters in the top and inches in the bottom and the intervals in the ruler are called hash marks.","timestamp":"05/05/2022 08:16:26","id":2}],"timestamp":"05/05/2022 08:16:26","id":3}] */