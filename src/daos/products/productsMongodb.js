import { MongodbContainer } from "../../containers/mongodbContainer.js";
import mongoose from 'mongoose'

let productsSchema = new mongoose.Schema({
    title: {type: String, require: true, max: 50},
    price: {type: Number, require: true, max: 10},
    thumbnail: {type: String, require: true},
    stock: {type: Number, require: true, max: 10}, 
    description: {type: String, require: true},
    timestamp: {type: String, require: true}
})

class DaoProductsMongodb extends MongodbContainer {
    constructor() {
        super('products', productsSchema)
    }
}

export default DaoProductsMongodb