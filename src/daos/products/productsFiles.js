import { FilesContainer } from "../../containers/filesContainer.js";

class DaoProductsFiles extends FilesContainer {
    constructor() {
        super(process.env.PRODUCTS)
    }
}

export default DaoProductsFiles

