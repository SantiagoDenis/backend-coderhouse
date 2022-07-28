
import {SERVICEACC, DBURL} from process.env

//Using imports drops an error, so i have to use this config to be able to use require
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
let admin = require('firebase-admin')
let serviceAccount = SERVICEACC // use the require method
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DBURL
});

export class FirebaseContainer {
    constructor(colName) {
        this.colName = colName
    }

    db = admin.firestore()
    query = admin.firestore().collection(`messages`)

    date = new Date()
    fullDate = `${this.date.getDate() < 10 ? '0' + (this.date.getDate() + 1) : (this.date.getDate() + 1)}/${this.date.getMonth() < 10 ? '0' + this.date.getMonth() : this.date.getMonth()}/${this.date.getFullYear()} ${this.date.getHours() < 10 ? '0' + (this.date.getHours()) : (this.date.getHours())}:${this.date.getMinutes() < 10 ? '0' + (this.date.getMinutes()) : (this.date.getMinutes())}:${this.date.getSeconds() < 10 ? '0' + (this.date.getSeconds()) : (this.date.getSeconds())}`

    async save(obj) {
        let doc = this.query.doc()
        const array = await this.getAll()
        await doc.create({...obj, timestamp: this.fullDate, id: (array.length + 1)})
    }

    async getById(id) {
        const doc = this.query.doc(`${id}`)
        console.log(doc)
        const element = await doc.get()
        const item = element.data()
        console.log(item)
        return item
    }

    async getAll() {
        const querySnapshot = await this.query.get()
        const docs = querySnapshot.docs
        const array = docs.map(doc => doc.data())
        return array
    }

    async deleteById(id) {
        const doc = this.query.doc(`${id}`)
        await doc.delete()
    }

    async updateById(id,  obj) {
        let doc = this.query.doc(`${id}`)
        await doc.update(obj)
    }

    async deleteAll() {
        const querySnapshot = this.query.get()
        const docs = (await querySnapshot).docs()
        await docs.forEach(doc => doc.delete())
    }
}