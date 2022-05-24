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

//First get response. Just to show something to the user. Not part of the instructions for the challenge
app.get('/', (request, response) => {
    response.send('<h1>You are in the main page!</h1><br/><ul><li>Go to "/products" to see all the array</li><li>Or, go to "/productsRandom" to see some a random choosen product!</li></ul>')
})

//Get response for localhost:8080/products. The output: The array of products
/* app.get('/products', async (request, response) => {
    let array = await readArray()
    response.send(array)
    
}) */

//Get response for localhost:8080/productsRandom. The output: One random chosen product
app.get('/productsRandom', async (request, response) => {
    let array = await readArray()
    let num = Math.floor(Math.random() * array.length)
    response.send(array[num])
})

/****************************************************** Router & Multer: Challenge class 8 ******************************************************/

//Notes: I will be using all the methods and the array of products from the class from challenge class 4.
//       You can go to the index.html file by using http:localhost/index.html

//getting the router
const {Router} = express
const router = Router()

//Middlewares to read as json and to read the encoded data from the form
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//Using the public folder as static value. 
app.use(express.static(__dirname + '/public'))

//Getter of products by accessing /api/products
/* router.get('/', async(req, res) => {
    let products = await (await executeMethods()).getAll()
    res.json(products)
}) */

router.get('/:id', async(req, res) => {
    let id = parseInt(req.params.id)
    let product = await (await executeMethods()).getById(id)
    res.json(await product)
})

//Post of a product by using the form in index or thunder client
router.post('/', async(req, res) => {
    const product = req.body
    await (await executeMethods()).save({
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail
    })
    const products = await (await executeMethods()).getAll()
    res.json(products)
})

//I created a new method in the class (updateById) to use for this specific situation
router.put('/:id', async(req, res) => {
    let id = parseInt(req.params.id)
    const product = req.body
    const newArray = await (await executeMethods()).updateById(id, product.title, product.price, product.thumbnail)
    res.json(newArray)
})

router.delete('/:id', async(req, res) => {
    let id = parseInt(req.params.id)
    const productsBefore = await (await executeMethods()).getAll()
    await (await executeMethods()).deleteById(id)
    if(id > productsBefore.length) {
        res.json({error: 'Product not found'})
    } else {
        const productsAfter = await (await executeMethods()).getAll()
        res.json(productsAfter)
    } 

})

//Using the router, with /api/products as the base uri
app.use('/products', router)


/* const { engine } = require('express-handlebars')

app.engine('handlebars', engine())
app.set('views', './hbs_views')
app.set('view engine', 'handlebars')
router.get('/', async(req, res) => {
    let products = await (await executeMethods()).getAll()
    res.render('home', {products: products})
})
 */

app.set('views', './pug_views')
app.set('view engine', 'pug')
router.get('/', async(req, res) => {
    let products = await (await executeMethods()).getAll()
    res.render('index', {products: products})
}) 

/* app.set('views', './ejs_views')
app.set('view engine', 'ejs')

router.get('/', async(req, res) => {
    let products = await (await executeMethods()).getAll()
    res.render('index', {products: products})
}) */

//Listener for the server
const server = app.listen(8080, () => console.log(`Server active at port: ${server.address().port}`))

//Error handler for the server listener
server.on('error', (error) => console.error(`Error on listening to server: ${error}`));
//Products array in products.txt
