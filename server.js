/*
const express = require('express')
const fs = require('fs')


//IMPORTANT: I'll re-use some constructor methods to manipulate the array of both messages and products

//Function to write or overwrite a file
const overwriteFile = async (fileName, array) => {
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
                    id: array.length + 1
                }
                array.push(newObject)
        
                await overwriteFile(this.fileName, array)
    
                return newObject.id
            }
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
            throw new Error('Couldt get all the elements')
        }
    }

    //I filter the array and return a new one without the object with that id
    async deleteById(id) {
        try {
            let array = await getArray(this.fileName)
            const newArray = array.filter(product => product.id !== id)
            await overwriteFile(this.fileName, newArray)
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
            await overwriteFile(this.fileName, array)
            return array
        } catch {
            throw new Error('Couldnt update the product')
        }
    }

    async deleteAll() {
        try {
            await overwriteFile(this.fileName, [])
        } catch {
            throw new Error('Problem with deleting the elements')
        }
    }

}

const executeMethods = async () => {
    try {
        const product = new Container('products.txt')
        return product
    } catch(error) {
        console.error(`The error is: ${error}`)
    }
}
executeMethods()

 //Setting up
const { Server: HttpServer } = require('http')
const { Server: SocketServer } = require('socket.io')

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

//Get to /products that sends the array and renders it
app.get('/products', async(req, res) => {
    let products = await (await executeMethods()).getAll()
    res.render('home', {products: products})
})

//Setting the connection socket event later to be called in the main.js file with the information
socketServer.on('connection', async(socket) => {
    const messages = await getArray('messages.txt')
    const products = await getArray('products.txt')

    //A doubdt I have here is wether or not the await is necessary. I think not because the promise its already finished with the await getArray()
    socket.emit('messages', await messages)
    socket.emit('products', await products)

    //On new_"X" event, i'll first push to the array the new info, write it in the txt file so that it lasts in memory and emit it globally.
    socket.on('new_message', (message) => {
        messages.push(message)
        overwriteFile('messages.txt', messages)
        socketServer.sockets.emit('messages', messages)
    })
    socket.on('new_product', (product) => {
        products.push(product)
        overwriteFile('products.txt', products)
        socketServer.sockets.emit('products', products)
    })

})

//Listening to the server but with http this time
const server = httpServer.listen(8080, () => console.log(`Server active at port: ${server.address().port}`)) */