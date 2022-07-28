
import fs from 'fs'
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
       
        const itExists = fs.existsSync(fileName)
        if(itExists) {
            return JSON.parse(await fs.promises.readFile(fileName));
        } else {
            return []
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

export class FilesContainer {
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

            let array = await getArray(this.fileName)
            return array

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

    async updateById(id, obj) {
        try {
            let array = await getArray(this.fileName)
            if(id > array.length) {
                return {error: 'Product not found'}
            }
            array.splice(id - 1, 1, {...obj, timestamp: fullDate, id: id})
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