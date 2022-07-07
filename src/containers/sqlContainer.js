
import Knex from 'knex'

export class SqlContainer {
    constructor(config, tableName) {
        this.knex = Knex({
            client: config.client,
            connection: config.connection
        })
        this.tableName = tableName
    }

    date = new Date()
    fullDate = `${this.date.getDate() < 10 ? '0' + (this.date.getDate() + 1) : (this.date.getDate() + 1)}/${this.date.getMonth() < 10 ? '0' + this.date.getMonth() : this.date.getMonth()}/${this.date.getFullYear()} ${this.date.getHours() < 10 ? '0' + (this.date.getHours()) : (this.date.getHours())}:${this.date.getMinutes() < 10 ? '0' + (this.date.getMinutes()) : (this.date.getMinutes())}:${this.date.getSeconds() < 10 ? '0' + (this.date.getSeconds()) : (this.date.getSeconds())}`

    async save(obj) {
        await this.knex(this.tableName).insert({...obj})
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

    async updateById(id,  obj) {
        await this.knex(this.tableName).where({"id": id}).update({...obj})
    }

    async deleteAll() {
        await this.knex(this.tableName).del()
    }
}