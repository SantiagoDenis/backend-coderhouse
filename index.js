//Calling File System
const fs = require('fs')
//Declaring an array of products which i'll use for the products.txt file

//Functio to write or overwrite a file
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

class Container {
    //the constructor with the file's name
    constructor(fileName) {
        this.fileName = fileName
    }
    //save method that ads an id to the product object depending on where its position is, and pushes it to the array. Then, writes the file with it.
    async save(object) {
        try {

            let array = await getArray(this.fileName)
            const newObject = {
                ...object,
                id: array.length + 1
            }
            array.push(newObject)
    
            await overwriteFile(this.fileName, array)

            return newObject.id
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
        //Console logging all the products
        console.log(await product.getAll())
    
        //COnsole logging just a single product by the id
        console.log(await product.getById(3))
    
        //Deleting a product by its id
        await product.deleteById(3)
    
        //Showing the products without the previously deleted
        console.log(await product.getAll())
        
        //Deleting all product
        await product.deleteAll()
    
        //Showing the empty array
        console.log(await product.getAll())

    } catch(error) {

        console.log(error)

    }

}

executeMethods()