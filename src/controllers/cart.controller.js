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
        req.logger.info("Creando un nuevo carrito.");
        try {
            const nuevoCarrito = await cartRepository.crearCarrito();
            res.json(nuevoCarrito);
        } catch (error) {
            req.logger.error("Error al crear un nuevo carrito:", error);
            res.status(500).send("Error");
        }
    }

    async obtenerProductosDeCarrito(req, res) {
        const carritoId = req.params.cid;
        req.logger.info(`Obteniendo productos del carrito con ID: ${carritoId}`);
        try {
            const productos = await cartRepository.obtenerProductosDeCarrito(carritoId);
            if (!productos) {
                req.logger.warn(`Carrito no encontrado: ${carritoId}`);
                return res.status(404).json({ error: "Carrito no encontrado" });
            }
            res.json(productos);
        } catch (error) {
            req.logger.error(`Error al obtener productos del carrito ${carritoId}:`, error);
            res.status(500).send("Error");
        }
    }

    async agregarProductoEnCarrito(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;
        req.logger.info(`Agregando producto al carrito. Cart ID: ${cartId}, Product ID: ${productId}, Quantity: ${quantity}`);

        try {
            const cart = await cartRepository.obtenerProductosDeCarrito(cartId);
            if (!cart) {
                req.logger.warn(`Carrito no encontrado: ${cartId}`);
                return res.status(404).json({ error: "Carrito no encontrado" });
            }

            const product = await productRepository.obtenerProductoPorId(productId);
            if (!product) {
                req.logger.warn(`Producto no encontrado: ${productId}`);
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            await cartRepository.agregarProducto(cartId, productId, quantity);

            if (!req.user || !req.user.cart) {
                req.logger.warn(`Usuario no autenticado o carrito no asociado a usuario`);
                return res.status(400).json({ error: "Usuario no autenticado o carrito no encontrado en el usuario" });
            }

            const carritoID = (req.user.cart).toString();
            req.logger.info(`Producto agregado. Redirigiendo a /carts/${carritoID}`);

            res.redirect(`/carts/${carritoID}`);
        } catch (error) {
            req.logger.error('Error al agregar producto al carrito:', error);
            res.status(500).send("Error al agregar producto al carrito");
        }
    }  

    async eliminarProductoDeCarrito(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        req.logger.info(`Eliminando producto del carrito. Cart ID: ${cartId}, Product ID: ${productId}`);
        try {
            const updatedCart = await cartRepository.eliminarProducto(cartId, productId);
            res.json({
                status: 'success',
                message: 'Producto eliminado del carrito correctamente',
                updatedCart,
            });
        } catch (error) {
            req.logger.error(`Error al eliminar producto del carrito ${cartId}:`, error);
            res.status(500).send("Error");
        }
    }

    async actualizarProductosEnCarrito(req, res) {
        const cartId = req.params.cid;
        const updatedProducts = req.body;
        req.logger.info(`Actualizando productos en el carrito. Cart ID: ${cartId}`);
        try {
            const updatedCart = await cartRepository.actualizarProductosEnCarrito(cartId, updatedProducts);
            res.json(updatedCart);
        } catch (error) {
            req.logger.error(`Error al actualizar productos en el carrito ${cartId}:`, error);
            res.status(500).send("Error");
        }
    }

    async actualizarCantidad(req, res) {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const newQuantity = req.body.quantity;
        req.logger.info(`Actualizando cantidad de producto en el carrito. Cart ID: ${cartId}, Product ID: ${productId}, Quantity: ${newQuantity}`);
        try {
            const updatedCart = await cartRepository.actualizarCantidadesEnCarrito(cartId, productId, newQuantity);
            res.json({
                status: 'success',
                message: 'Cantidad del producto actualizada correctamente',
                updatedCart,
            });
        } catch (error) {
            req.logger.error(`Error al actualizar la cantidad de productos en el carrito ${cartId}:`, error);
            res.status(500).send("Error al actualizar la cantidad de productos");
        }
    }

    async vaciarCarrito(req, res) {
        const cartId = req.params.cid;
        req.logger.info(`Vaciando el carrito. Cart ID: ${cartId}`);
        try {
            const updatedCart = await cartRepository.vaciarCarrito(cartId);
            res.json({
                status: 'success',
                message: 'Todos los productos del carrito fueron eliminados correctamente',
                updatedCart,
            });
        } catch (error) {
            req.logger.error(`Error al vaciar el carrito ${cartId}:`, error);
            res.status(500).send("Error");
        }
    }

    async finalizarCompra(req, res) {
        const cartId = req.params.cid;
        req.logger.info(`Finalizando compra para el carrito. Cart ID: ${cartId}`);
        try {
            const cart = await cartRepository.obtenerProductosDeCarrito(cartId);
            const products = cart.products;
            const productosNoDisponibles = [];

            for (const item of products) {
                const productId = item.product._id;
                const product = await productRepository.obtenerProductoPorId(productId);
                if (product.stock >= item.quantity) {
                    product.stock -= item.quantity;
                    await product.save();
                } else {
                    productosNoDisponibles.push(productId);
                }
            }

            const userWithCart = await UserModel.findOne({ cart: cartId });
            const ticket = new TicketModel({
                code: generateUniqueCode(),
                purchase_datetime: new Date(),
                amount: calcularTotal(cart.products),
                purchaser: userWithCart._id
            });
            await ticket.save();
            cart.products = cart.products.filter(item => !productosNoDisponibles.some(productId => productId.equals(item.product._id)));
            await cart.save();
            await emailManager.enviarCorreoCompra(userWithCart.email, userWithCart.first_name, ticket.code);

            res.status(200).json({ success: true });
        } catch (error) {
            req.logger.error('Error al procesar la compra:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }   
}

module.exports = CartController;
