import { FilesContainer } from "../../containers/filesContainer.js";

class DaoCartFiles extends FilesContainer {
    constructor() {
        super('cart.txt')
    }
}

export default DaoCartFiles