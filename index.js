/****************************************************** Files in Nodejs. Challenge class 4 ******************************************************/


//Calling File System
const fs = require('fs')

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
            return findId ? findId : null
        } catch {
            throw new Error('Couldt get the element by id')
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
            array = array.filter(product => product.id !== id)
            await overwriteFile(this.fileName, array)
        } catch {
            throw new Error('Couldt delete the element by id')
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
        await product.save({
            title: 'ruler',
            price: 70.5,
            thumbnail: 'generic url'
        })
        await product.save({
            title: 'pencil',
            price: 40,
            thumbnail: 'generic url'
        })
        await product.save({
            title: 'notebook',
            price: 290,
            thumbnail: 'generic url'
        })
        return product

    } catch(error) {

        console.error(`The error is: ${error}`)

    }

}
executeMethods()

/****************************************************** First Express Server: Challenge class 6 ******************************************************/

//Requesting the library from the pre-installed module
const express = require('express')
const app = express()

//Function to read the products.txt file so i can output it in the .get responses 
const readArray = async() => {
    const exists = fs.existsSync('products.txt')
    if(exists) {
        return JSON.parse(await fs.promises.readFile('products.txt'))
    }
}
//sarasa
//First get response. Just to show something to the user. Not part of the instructions for the challenge
app.get('/', (request, response) => {
    response.send('<h1>You are in the main page!</h1><br/><ul><li>Go to "/products" to see all the array</li><li>Or, go to "/productsRandom" to see some a random choosen product!</li></ul>')
})

//Get response for localhost:8080/products. The output: The array of products
app.get('/products', async (request, response) => {
    let array = await readArray()
    response.send(array)
    
})

//Get response for localhost:8080/productsRandom. The output: One random chosen product
app.get('/productsRandom', async (request, response) => {
    let array = await readArray()
    let num = Math.floor(Math.random() * array.length)
    response.send(array[num])
})

//Listener for the server
const server = app.listen(8080, () => console.log(`Server active at port: ${server.address().port}`))

//Error handler for the server listener
server.on('error', (error) => console.error(`Error on listening to server: ${error}`));