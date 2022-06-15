

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