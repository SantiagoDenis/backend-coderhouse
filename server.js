

 //Setting up
const { Server: HttpServer } = require('http')
const { Server: SocketServer } = require('socket.io')

const express = require('express')
const app = express()
//Sending the static values from the public folder
app.use(express.static('public'))


const httpServer = new HttpServer(app)
const socketServer = new SocketServer(httpServer)

//Setting handlebars up for rendering the products table
const { engine } = require('express-handlebars')
app.engine('handlebars', engine())
app.set('views', './hbs_views')
app.set('view engine', 'handlebars')

const Knex = require('knex')

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
}

class Container {
    constructor(config, tableName) {
        this.knex = Knex({
            client: config.client,
            connection: config.connection
        })
        this.tableName = tableName
    }
    //Function meant to be executed once, so that it can create the table.
    async writeDB() {
        if (this.tableName === 'messages') {

            await this.knex.schema.dropTableIfExists(this.tableName)
            await this.knex.schema.createTable(this.tableName, table => {
                table.increments('id').primary()
                table.string('userEmail', 30).notNullable()
                table.string('userText', 255).notNullable()
                table.string('fullDate', 255)
            })
        } else if (this.tableName === 'products') {
            await this.knex.schema.dropTableIfExists(this.tableName)
            await this.knex.schema.createTable(this.tableName, table => {
                table.increments('id').primary()
                table.string('title', 30).notNullable()
                table.float('price').notNullable()
                table.string('thumbnail', 255).notNullable()
                table.integer('stock').notNullable()
                table.string('description', 255).notNullable()
                table.string('timestamp', 255)
            })
        }
    }

    date = new Date()
    fullDate = `${this.date.getDate() < 10 ? '0' + (this.date.getDate() + 1) : (this.date.getDate() + 1)}/${this.date.getMonth() < 10 ? '0' + this.date.getMonth() : this.date.getMonth()}/${this.date.getFullYear()} ${this.date.getHours() < 10 ? '0' + (this.date.getHours()) : (this.date.getHours())}:${this.date.getMinutes() < 10 ? '0' + (this.date.getMinutes()) : (this.date.getMinutes())}:${this.date.getSeconds() < 10 ? '0' + (this.date.getSeconds()) : (this.date.getSeconds())}`

    async save(obj) {
        await this.knex(this.tableName).insert({...obj})
    }

    async getById(id) {
        const element = await this.knex(this.tableName).where({"id": id})
        return element
    }

    async getAll() {
        const array = await this.knex.from(this.tableName).select('*')
        return array
    }

    async deleteById(id) {
        await this.knex(this.tableName).where({"id": id}).del()
    }

    async updateById(id,  title, price, thumbnail, stock, description) {
        await this.knex(this.tableName).where({"id": id}).update({title: title, price: price, thumbnail: thumbnail, stock: stock, description: description})
    }

    async deleteAll() {
        await this.knex(this.tableName).del()
    }
}


const productsTable = new Container(mysqlKnex, 'products')
const messagesTable = new Container(sqlite3Knex, 'messages')
//messagesTable.writeDB()

//Get to /products that sends the array and renders it
app.get('/products', async(req, res) => {
    const products = await productsTable.getAll()
    res.render('home', {products: products})
})

//Setting the connection socket event later to be called in the main.js file with the information
socketServer.on('connection', async(socket) => {
    const messages = await messagesTable.getAll()
    const products = await productsTable.getAll()

    socket.emit('messages', await messages)
    socket.emit('products', await products)

    //On new_"X" event, i'll first push to the array the new info, write it in the txt file so that it lasts in memory and emit it globally.
    socket.on('new_message', (message) => {
        messagesTable.save(message)
        socketServer.sockets.emit('messages', messages)
    })
    socket.on('new_product', (product) => {
        productsTable.save(product)
        socketServer.sockets.emit('products', products)
    })
})

//Listening to the server but with http this time
const server = httpServer.listen(8080, () => console.log(`Server active at port: ${server.address().port}`))

/* [{"title":"a8f7820c-b44e-4699-a370-c9df82e08620","products":[{"title":"Calculator","price":100,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-256.png","stock":100,"description":"A device that performs arithmetic operations on numbers. It can do from addition, subtraction, multiplication, and division to more sophisticated operations such as can handle exponential operations, roots, logarithms, etc.","timestamp":"05/05/2022 08:16:26","id":1},{"title":"Board","price":300,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/board-math-class-school-256.png","stock":100,"description":"Is a reusable writing surface on which texts and figures are drawn with chalk or other types of erasable markers. ","timestamp":"05/05/2022 08:16:26","id":2}],"timestamp":"05/05/2022 08:16:26","id":1},{"title":"e542e8ca-3e2a-4858-ba39-f609aa2160ce","products":[{"title":"Pencil","price":20,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png","stock":100,"description":"A writing or drawing implement with a solid pigment core encased in a sleeve, barrel, or shaft that prevents breaking the core or marking a user's hand.","timestamp":"05/05/2022 08:16:26","id":1},{"title":"Note pad","price":70,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/paper-clip-academic-note-exam-256.png","stock":100,"description":"A book or stack of paper pages that are often ruled and used for purposes such as recording notes or memoranda, other writing, drawing or scrapbooking.","timestamp":"05/05/2022 08:16:26","id":2}],"timestamp":"05/05/2022 08:16:26","id":2},{"title":"a33519be-7916-4c9c-ade8-fe87b018c0ae","products":[{"title":"Backpack","price":250,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/bag-pack-container-school-256.png","stock":100,"description":"A bag put on somebody's back. It has two straps that go over the shoulders. It is used to carry things in it, and it often has many pockets or compartments to carry things.","timestamp":"05/05/2022 08:16:26","id":1},{"title":"Ruler","price":40,"thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png","stock":100,"description":"A tool or device used to measure length and draw straight lines. A ruler is used to measure the length in both metric and customary units. The rulers are marked with standard distance in centimeters in the top and inches in the bottom and the intervals in the ruler are called hash marks.","timestamp":"05/05/2022 08:16:26","id":2}],"timestamp":"05/05/2022 08:16:26","id":3}] */