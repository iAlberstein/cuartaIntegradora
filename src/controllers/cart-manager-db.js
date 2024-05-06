const CartModel = require("../models/cart.model.js");

class CartManager {

    async crearCarrito() {
        try {
            const nuevoCarrito = new CartModel({products: []});
            await nuevoCarrito.save();
            return nuevoCarrito;
        } catch (error) {
            console.log("Error al crear un carrito nuevo", error);
            throw error; 
        }
    }

    async getCarts() {
        try {
            const carts = await CartModel.find().populate('products'); // Aquí se utiliza populate
            return carts;
        } catch (error) {
            console.log("Error al obtener los carritos:", error);
            throw error;
        }
    }
    
    async getCarritoById(cartId) {
        try {
            const carrito = await CartModel.findById(cartId).populate('products'); // Aquí se utiliza populate
    
            if (!carrito) {
                console.log("No hay carrito con ese ID");
                return null;
            }
    
            return carrito;
    
        } catch (error) {
            console.log("Error al obtener un carrito por ID", error);
            throw error;
        }
    }    
    

    async agregarProductoAlCarrito(cartId, productId, quantity = 1) {
        try {
            const carrito = await this.getCarritoById(cartId);
            const existeProducto = carrito.products.find(item => item.product.toString() === productId);

            if(existeProducto) {
                existeProducto.quantity += quantity; 
            } else {
                carrito.products.push({product: productId, quantity});
            }
            
            carrito.markModified("products");

            await carrito.save();
            return carrito;
            
        } catch (error) {
            console.log("Error al agregar un producto", error);
            throw error; 
        }
    }
}

module.exports = CartManager;
