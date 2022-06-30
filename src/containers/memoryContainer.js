

export class MemoryContainer {

    memory = []
    date = new Date()
    fullDate = `${this.date.getDate() < 10 ? '0' + (this.date.getDate() + 1) : (this.date.getDate() + 1)}/${this.date.getMonth() < 10 ? '0' + this.date.getMonth() : this.date.getMonth()}/${this.date.getFullYear()} ${this.date.getHours() < 10 ? '0' + (this.date.getHours()) : (this.date.getHours())}:${this.date.getMinutes() < 10 ? '0' + (this.date.getMinutes()) : (this.date.getMinutes())}:${this.date.getSeconds() < 10 ? '0' + (this.date.getSeconds()) : (this.date.getSeconds())}`

    async save(obj) {
        this.memory.push({...obj, timestamp: this.fullDate, id: (this.memory.length + 1)})
    }
    
    async getById(id) {
        const element = this.memory.find(item => item.id === id)
        return element
    }

    async getAll() {
        return this.memory
    }

    async deleteById(id) {
        this.memory = this.memory.splice(id, 1)
    }

    async updateById(id,  obj) {
        let element = this.memory.find(item => item.id === id)
        element = {...obj, id: id}
        return element
    }

    async deleteAll() {
        this.memory = []
    }
}