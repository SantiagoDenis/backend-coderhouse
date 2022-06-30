import { FirebaseContainer } from "../../containers/firebaseContainer.js";

class DaoCartFirebase extends FirebaseContainer {
    constructor() {
        super('carts')
    }
}

export default DaoCartFirebase