import { MongodbContainer } from "../../containers/mongodbContainer.js";
import mongoose from 'mongoose'

let cartSchema = new mongoose.Schema({
    title: {type: String, require: true, max: 100},
    products: {type: Array, require: true, max: 10},
    timestamp: {type: String, require: true}
})

class DaoCartMongodb extends MongodbContainer {
    constructor() {
        super('carts', cartSchema)
    }
}

export default DaoCartMongodb