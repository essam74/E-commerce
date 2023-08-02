import { roles } from "../../middleware/auth.js";


export const endPoint = {
    createProduct: [roles.User],
    updateProduct: [roles.User],
    wishlist: [roles.User]
}