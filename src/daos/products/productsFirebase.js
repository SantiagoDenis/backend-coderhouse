import { FirebaseContainer } from "../../containers/firebaseContainer.js";

class DaoProductsFirebase extends FirebaseContainer {
    constructor() {
        super('products')
    }
}

export default DaoProductsFirebase