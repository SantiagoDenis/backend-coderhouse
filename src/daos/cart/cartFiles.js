import { FilesContainer } from "../../containers/filesContainer.js";

class DaoCartFiles extends FilesContainer {
    constructor() {
        super(process.env.CART)
    }
}

export default DaoCartFiles