const express = require("express");
const router = express.Router();
const CartManager = require("../controllers/cart-manager-db.js");
const cartManager = new CartManager();

router.get("/carts", async (req, res) => {
    try {
        const carts = await cartManager.getCarts();
        res.json(carts);
    } catch (error) {
        console.error("Error al obtener los carritos:", error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

router.post("/carts", async (req, res) => {
    try {
        const nuevoCarrito = await cartManager.crearCarrito();
        res.json(nuevoCarrito);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

router.get("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;

    try {
        const carrito = await cartManager.getCarritoById(cartId);
        res.json(carrito.products);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

router.post("/carts/:cid/product/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const quantity = req.body.quantity || 1;

    try {
        const actualizarCarrito = await cartManager.agregarProductoAlCarrito(cartId, productId, quantity);
        res.json(actualizarCarrito.products);
    } catch (error) {
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

// DELETE /api/carts/:cid/products/:pid
router.delete("/carts/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    try {
        await cartManager.eliminarProductoDelCarrito(cartId, productId);
        res.json({ message: "Producto eliminado del carrito correctamente" });
    } catch (error) {
        console.error("Error al eliminar producto del carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// PUT /api/carts/:cid
router.put("/carts/:cid", async (req, res) => {
    const cartId = req.params.cid;
    const { products } = req.body;

    try {
        await cartManager.actualizarCarrito(cartId, products);
        res.json({ message: "Carrito actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar carrito:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// PUT /api/carts/:cid/products/:pid
router.put("/carts/:cid/products/:pid", async (req, res) => {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;

    try {
        await cartManager.actualizarCantidadProducto(cartId, productId, quantity);
        res.json({ message: "Cantidad del producto actualizada correctamente" });
    } catch (error) {
        console.error("Error al actualizar cantidad del producto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router;
