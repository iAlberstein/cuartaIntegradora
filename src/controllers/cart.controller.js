const TicketModel = require("../models/ticket.model.js");
const UserModel = require("../models/user.model.js");
const CartRepository = require("../repositories/cart.repository.js");
const cartRepository = new CartRepository();
const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();
const { generateUniqueCode, calcularTotal } = require("../utils/cartutils.js");
const EmailManager = require('../services/email');
const emailManager = new EmailManager();

class CartController {
    async nuevoCarrito(req, res) {
        try {
            const nuevoCarrito = await cartRepository.crearCarrito();
            res.json(nuevoCarrito);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async obtenerProductosDeCarrito(req, res) {
        const carritoId = req.params.cid;
        try {
            const productos = await cartRepository.obtenerProductosDeCarrito(carritoId);
            if (!productos) {
                return res.status(404).json({ error: "Carrito no encontrado" });
            }
            res.json(productos);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async agregarProductoEnCarrito(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
        console.log(`Cart ID: ${cartId}, Product ID: ${productId}, Quantity: ${quantity}`);

        try {
            const cart = await cartRepository.obtenerProductosDeCarrito(cartId);
            if (!cart) {
                console.log(`Carrito no encontrado: ${cartId}`);
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            const product = await productRepository.obtenerProductoPorId(productId);
            if (!product) {
                console.log(`Producto no encontrado: ${productId}`);
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            await cartRepository.agregarProducto(cartId, productId, quantity);

            if (!req.user || !req.user.cart) {
                console.log(`Usuario no autenticado o carrito no asociado a usuario`);
                return res.status(400).json({ error: "Usuario no autenticado o carrito no encontrado en el usuario" });
            }

            const carritoID = (req.user.cart).toString();
            console.log(`Producto agregado. Redirigiendo a /carts/${carritoID}`);

            res.redirect(`/carts/${carritoID}`);
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error);
            res.status(500).send("Error al agregar producto al carrito");
        }
    }  

    async eliminarProductoDeCarrito(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        try {
            const updatedCart = await cartRepository.eliminarProducto(cartId, productId);
            res.json({
                status: 'success',
                message: 'Producto eliminado del carrito correctamente',
                updatedCart,
            });
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async actualizarProductosEnCarrito(req, res) {
        const cartId = req.params.cid;
        const updatedProducts = req.body;
        // Debes enviar un arreglo de productos en el cuerpo de la solicitud
        try {
            const updatedCart = await cartRepository.actualizarProductosEnCarrito(cartId, updatedProducts);
            res.json(updatedCart);
        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async actualizarCantidad(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        try {
            const updatedCart = await cartRepository.actualizarCantidadesEnCarrito(cartId, productId, newQuantity);

            res.json({
                status: 'success',
                message: 'Cantidad del producto actualizada correctamente',
                updatedCart,
            });

        } catch (error) {
            res.status(500).send("Error al actualizar la cantidad de productos");
        }
    }

    async vaciarCarrito(req, res) {
        const cartId = req.params.cid;
        try {
            const updatedCart = await cartRepository.vaciarCarrito(cartId);

            res.json({
                status: 'success',
                message: 'Todos los productos del carrito fueron eliminados correctamente',
                updatedCart,
            });

        } catch (error) {
            res.status(500).send("Error");
        }
    }

    async finalizarCompra(req, res) {
        const cartId = req.params.cid;
        try {
            // Obtener el carrito y sus productos
            const cart = await cartRepository.obtenerProductosDeCarrito(cartId);
            const products = cart.products;
    
            // Inicializar un arreglo para almacenar los productos no disponibles
            const productosNoDisponibles = [];
    
            // Verificar el stock y actualizar los productos disponibles
            for (const item of products) {
                const productId = item.product._id;
                const product = await productRepository.obtenerProductoPorId(productId);
                if (product.stock >= item.quantity) {
                    // Si hay suficiente stock, restar la cantidad del producto
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                    // Si no hay suficiente stock, agregar el ID del producto al arreglo de no disponibles
                    productosNoDisponibles.push(productId);
                }
            }
    
            const userWithCart = await UserModel.findOne({ cart: cartId });
    
            // Crear un ticket con los datos de la compra
            const ticket = new TicketModel({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calcularTotal(cart.products),
                purchaser: userWithCart._id
            });
            await ticket.save();
    
            // Eliminar del carrito los productos que sí se compraron
            cart.products = cart.products.filter(item => !productosNoDisponibles.some(productId => productId.equals(item.product._id)));
    
            // Guardar el carrito actualizado en la base de datos
            await cart.save();
    
            // Enviar email con la información del ticket
            await emailManager.enviarCorreoCompra(userWithCart.email, userWithCart.first_name, ticket.code);
    
            // Redirigir a la página de checkout sin pasar datos en la URL
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }    
}

module.exports = CartController;
