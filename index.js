
//Calling File System

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
    connection: sqliteOptions
}


//Requesting the library from the pre-installed module
const express = require('express')
const app = express()

class Container {
    constructor(config, tableName) {
        this.knex = Knex({
            client: config.client,
            connection: config.connection
        })
        this.tableName = tableName
    }

    date = new Date()
    fullDate = `${this.date.getDate() < 10 ? '0' + (this.date.getDate() + 1) : (this.date.getDate() + 1)}/${this.date.getMonth() < 10 ? '0' + this.date.getMonth() : this.date.getMonth()}/${this.date.getFullYear()} ${this.date.getHours() < 10 ? '0' + (this.date.getHours()) : (this.date.getHours())}:${this.date.getMinutes() < 10 ? '0' + (this.date.getMinutes()) : (this.date.getMinutes())}:${this.date.getSeconds() < 10 ? '0' + (this.date.getSeconds()) : (this.date.getSeconds())}`
    

    async writeDB() {
        if (this.tableName === 'messages') {

            await this.knex.schema.dropTableIfExists(this.tableName)
            await this.knex.schema.createTable(this.tableName, table => {
                table.increments('id').primary()
                table.string('userEmail', 30).notNullable()
                table.string('userText', 255).notNullable()
                table.string('timestamp', 255)
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

    async save(obj) {
        await this.knex(this.tableName).insert({...obj, timestamp: this.fullDate})
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


//getting the router
const {Router} = express
const productsRouter = Router()

//Middlewares to read as json and to read the encoded data from the form
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const user = {
    isAdmin: true
}
//Middleware of validation
const validation = (req, res, next) => {
    if (user.isAdmin) next()
    else res.status(401).send({error: 'You have no permission to enter'})
}

//Using the public folder as static value. 
app.use(express.static(__dirname + '/public'))

productsRouter.get('/', async(req, res) => {
    const products = await productsTable.getAll()
    res.json(products)
})

productsRouter.get('/:id', async(req, res) => {
    const id = parseInt(req.params.id)
    const product = await productsTable.getById(id)
    if (!product[0]) res.json({error: 'couldnt find the product with that id'})
    else res.json(product)
})

//Post of a product by using the form in index or thunder client
productsRouter.post('/', validation, async(req, res) => {
    const product = req.body
    await productsTable.save({
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        stock: product.stock,
        description: product.description
    })
    const products = await productsTable.getAll()
    res.json(products)
})

//I created a new method in the class (updateById) to use for this specific situation
productsRouter.put('/:id', validation, async(req, res) => {
    const id = parseInt(req.params.id)
    const findProduct = await productsTable.getById(id)
    if (!findProduct[0]) res.json({error: 'couldnt find the product with that id'})
    const product = req.body
    await productsTable.updateById(id, product.title, product.price, product.thumbnail, product.stock, product.description)
    const products = await productsTable.getAll()
    res.json(products)
})

productsRouter.delete('/:id', validation, async(req, res) => {
    const id = parseInt(req.params.id)
    const findProduct = await productsTable.getById(id)
    if (!findProduct[0]) res.json({error: 'couldnt find the product with that id'})
    await productsTable.deleteById(id)
    const products = await productsTable.getAll()
    res.json(products)

})

//Using the router, with /api/products as the base uri
app.use('/api/products', productsRouter)

//Listener for the server
const server = app.listen(8080, () => console.log(`Server active at port: ${server.address().port}`))

//Error handler for the server listener
server.on('error', (error) => console.error(`Error on listening to server: ${error}`));
/* 
//Calling File System
const fs = require('fs')

const Knex = require('knex')

const mysqlOptions = {
    host: '127.0.0.1',
    user: 'root',
    password: 'amorfoda70',
    database: 'products'
}

//Requesting the library from the pre-installed module
const express = require('express')
const app = express()

//Getting uuid for each unique cart title
const { v4: uuid } = require('uuid');

//Function to write or overwrite a file
const overwriteDB = async (fileName, array) => {
    try {
        await fs.promises.writeFile(`${fileName}`, JSON.stringify(array))
    } catch {
        throw new Error('Problem with the writing of the file')
    }
}

//Function to convert the file text into an array so i can manipulate it later
const getArray = async (fileName) => {
    try {        
        const itExists = fs.existsSync(fileName)
        if(itExists) {
            return JSON.parse(await fs.promises.readFile(fileName));
        } else {
            return []
        }
    } catch {
        throw new Error('Problem with getting the array out of the file')
    }
}
//to get the timestamp for the cart and products
const date = new Date()
const fullDate = `${date.getDate() < 10 ? '0' + (date.getDate() + 1) : (date.getDate() + 1)}/${date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()}/${date.getFullYear()} ${date.getHours() < 10 ? '0' + (date.getHours()) : (date.getHours())}:${date.getMinutes() < 10 ? '0' + (date.getMinutes()) : (date.getMinutes())}:${date.getSeconds() < 10 ? '0' + (date.getSeconds()) : (date.getSeconds())}`

//Function to prevent the function save to save duplicate products
const isInArray = async (fileName, title) => {
    const array = await getArray(fileName)
    return array.some(element => element.title === title)
}

class Container {
    //the constructor with the file's name
    constructor(fileName) {
        this.fileName = fileName
    }
    //save method that adds an id to the product object depending on where its position is, and pushes it to the array. Then, writes the file with it.
    async save(object) {
        try {

            let array = await getArray(this.fileName)
            let isRepeated = await isInArray(this.fileName, object.title)
            if (!isRepeated) {

                const newObject = {
                    ...object,
                    timestamp: fullDate,
                    id: array.length + 1
                }
                array.push(newObject)
        
                await overwriteDB(this.fileName, array)
    
                return newObject.id
            }
        } catch {
            throw new Error('problem with save method of the object')
        }

    }

    async saveInCart(object, idCart) {
        try {

            let array = await getArray(this.fileName)
            const cart = array[idCart - 1]
            let newObject = {
                ...object,
                timestamp: fullDate,
                id: cart.products.length + 1
            }
            cart.products.push(newObject)
            await overwriteDB(this.fileName, array)
    
            return newObject.id
        } catch {
            throw new Error('problem with save method of the object')
        }

    }

    async getById(id) {
        try {
            let array = await getArray(this.fileName)
            const findId = array.find(object => object.id === id)
            return findId ? findId : {error: 'Product not found'}
        } catch {
            throw new Error('Couldnt get the element by id')
        }
    }

    async getAll() {
        try {
            let array = await getArray(this.fileName)
            return array
        } catch {
            throw new Error('Couldnt get all the elements')
        }
    }

    //I filter the array and return a new one without the object with that id
    async deleteById(id) {
        try {
            let array = await getArray(this.fileName)
            const newArray = array.filter(product => product.id !== id)
            await overwriteDB(this.fileName, newArray)
        } catch {
            throw new Error('Couldnt delete the element by id')
        }
    }

    async deleteFromCart(idCart, idProduct) {
        try {
            let carts = await getArray(this.fileName)
            let cart = carts[idCart - 1]
            cart.products = cart.products.filter(product => product.id !== idProduct)
            await overwriteDB(this.fileName, carts)
        } catch {
            throw new Error('Couldnt delete the element by id')
        }
    }

    async updateById(id, title, price, thumbnail) {
        try {
            let array = await getArray(this.fileName)
            if(id > array.length) {
                return {error: 'Product not found'}
            }
            array.splice(id - 1, 1, {title: title, price: price, thumbnail: thumbnail, id: id})
            await overwriteDB(this.fileName, array)
            return array
        } catch {
            throw new Error('Couldnt update the product')
        }
    }

    async deleteAll() {
        try {
            await overwriteDB(this.fileName, [])
        } catch {
            throw new Error('Problem with deleting the elements')
        }
    }

}

const executeMethods = async (fileName) => {
    try {
        let fileArray = new Container(fileName)
        return fileArray
    } catch(error) {
        console.error(`The error is: ${error}`)
    }
}
executeMethods('products.txt')
executeMethods('cart.txt')

//getting the router
const {Router} = express
const productsRouter = Router()
const cartRouter = Router()

//Middlewares to read as json and to read the encoded data from the form
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const user = {
    isAdmin: true
}
//Middleware of validation
const validation = (req, res, next) => {
    if (user.isAdmin) next()
    else res.status(401).send({error: 'You have no permission to enter'})
}

//Using the public folder as static value. 
app.use(express.static(__dirname + '/public'))

productsRouter.get('/', async(req, res) => {
    let products = await (await executeMethods('products.txt')).getAll()
    res.json(products)
})

productsRouter.get('/:id', async(req, res) => {
    let id = parseInt(req.params.id)
    let product = await (await executeMethods('products.txt')).getById(id)
    res.json(product)
})

//Post of a product by using the form in index or thunder client
productsRouter.post('/', validation, async(req, res) => {
    const product = req.body
    await (await executeMethods('products.txt')).save({
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        stock: product.stock,
        description: product.description
    })
    const products = await (await executeMethods('products.txt')).getAll()
    res.json(products)
})

//I created a new method in the class (updateById) to use for this specific situation
productsRouter.put('/:id', validation, async(req, res) => {
    let id = parseInt(req.params.id)
    const product = req.body
    const newArray = await (await executeMethods('products.txt')).updateById(id, product.title, product.price, product.thumbnail, product.stock, product.description)
    res.json(newArray)
})

productsRouter.delete('/:id', validation, async(req, res) => {
    let id = parseInt(req.params.id)
    const productsBefore = await (await executeMethods('products.txt')).getAll()
    await (await executeMethods('products.txt')).deleteById(id)
    if(id > productsBefore.length) {
        res.json({error: 'Product not found'})
    } else {
        const productsAfter = await (await executeMethods('products.txt')).getAll()
        res.json(productsAfter)
    } 

})

cartRouter.get('/', validation, async(req, res) => {
    const carts = await (await executeMethods('cart.txt')).getAll()
    res.json(carts)
})

//Getting a cart product
cartRouter.get('/:idCart/:idProduct', async(req, res) => {
    const idCart = parseInt(req.params.idCart)
    const idProduct = parseInt(req.params.idProduct)
    const carts = await (await executeMethods('cart.txt')).getAll()
    if( idCart > carts.length) {
        res.json({error: 'Cart not found'})
    }
    const cart = await (await executeMethods('cart.txt')).getById(idCart)
    if (idProduct > cart.products.length) {
        res.json({error: 'Product not found'})
    }
    const product = cart.products[(idProduct - 1)]
    res.json(product)
})

cartRouter.get('/:id', async(req, res) => {
    let id = parseInt(req.params.id)
    const carts = await (await executeMethods('cart.txt')).getAll()
    if( id > carts.length) {
        res.json({error: 'Cart not found'})
    }
    let cartItem = await (await executeMethods('cart.txt')).getById(id)
    res.json(cartItem)
})

//Create a new cart
cartRouter.post('/', async(req, res) => {
    await (await executeMethods('cart.txt')).save({
        title: uuid(),
        products: [],
        timestamp: fullDate
    })
    const carts = await (await executeMethods('cart.txt')).getAll()
    res.json(carts)
})

cartRouter.post('/:idCart/:idProduct', async(req, res) => {
    const idCart = parseInt(req.params.idCart)
    const idProduct = parseInt(req.params.idProduct)
    const products = await (await executeMethods('products.txt')).getAll()
    if (idProduct > products.length) {
        res.json({error: 'Product not found'})
    }
    const product = await (await executeMethods('products.txt')).getById(idProduct)
    await (await executeMethods('cart.txt')).saveInCart({
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        stock: product.stock,
        description: product.description
    }, idCart)
    const newCart = await (await executeMethods('cart.txt')).getById(idCart)
    res.json(newCart)
})

cartRouter.delete('/:id', async(req, res) => {
    let id = parseInt(req.params.id)
    const cartBefore = await (await executeMethods('cart.txt')).getAll()
    if(id > cartBefore.length) {
        res.json({error: 'Product not found'})
    }
    await (await executeMethods('cart.txt')).deleteById(id)
    const cartAfter = await (await executeMethods('cart.txt')).getAll()
    res.json(cartAfter)

})
cartRouter.delete('/:idCart/:idProduct', async(req, res) => {
    let idCart = parseInt(req.params.idCart)
    let idProduct = parseInt(req.params.idProduct)
    const cartBefore = await (await executeMethods('cart.txt')).getById(idCart)
    if(idProduct > cartBefore.products.length) {
        res.json({error: 'Product not found'})
    }
    await (await executeMethods('cart.txt')).deleteFromCart(idCart, idProduct)
    const cartAfter = await (await executeMethods('cart.txt')).getAll()
    res.json(cartAfter)
})

//Using the router, with /api/products as the base uri
app.use('/api/products', productsRouter)
app.use('/api/cart', cartRouter)

//Listener for the server
const server = app.listen(8080, () => console.log(`Server active at port: ${server.address().port}`))

//Error handler for the server listener
server.on('error', (error) => console.error(`Error on listening to server: ${error}`));
 */