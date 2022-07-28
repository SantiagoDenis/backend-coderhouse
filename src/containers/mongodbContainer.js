import mongoose from 'mongoose'



//this has to be hardcoded. If not, it doesnt let me enter the schema without interpreting it as undefined
let productsSchema = new mongoose.Schema({
    title: {type: String, require: true, max: 50},
    price: {type: Number, require: true},
    thumbnail: {type: String, require: true},
    stock: {type: Number, require: true}, 
    description: {type: String, require: true},
    timestamp: {type: String, require: true}
})
export class MongodbContainer {
    
    constructor(colName, schema) {
        this.colName = colName
        this.schema = schema
    }
    column = mongoose.model('products', productsSchema)
    date = new Date()
    fullDate = `${this.date.getDate() < 10 ? '0' + (this.date.getDate() + 1) : (this.date.getDate() + 1)}/${this.date.getMonth() < 10 ? '0' + this.date.getMonth() : this.date.getMonth()}/${this.date.getFullYear()} ${this.date.getHours() < 10 ? '0' + (this.date.getHours()) : (this.date.getHours())}:${this.date.getMinutes() < 10 ? '0' + (this.date.getMinutes()) : (this.date.getMinutes())}:${this.date.getSeconds() < 10 ? '0' + (this.date.getSeconds()) : (this.date.getSeconds())}`
    async save(obj) {
        let newModel = new this.column({...obj, timestamp: this.fullDate})
        await newModel.save()
    }
    
    async getById(id) {
        let element = await this.column.findById(id)
        return element
    }

    async getAll() {
        let array = await this.column.find({})
        return array
    }

    async deleteById(id) {
        await this.column.deleteOne({_id: id})
    }

    async updateById(id,  obj) {
        let element = await this.column.updateOne({_id: id}, {$set: {...obj}})
        return element
    }

    async deleteAll() {
        await this.column.deleteMany({})
    }
}
