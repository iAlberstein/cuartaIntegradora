const express = require("express");
const router = express.Router();
const ProductManager = require("../controllers/product-manager-db.js");
const ProductModel = require("../models/product.model");

const productManager = new ProductManager();

router.get("/products", async (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;

    limit = parseInt(limit);
    page = parseInt(page);

    // Definir el objeto de opciones de paginación
    const options = {
        limit,
        page,
    };

    // Verificar si se proporcionó un criterio de búsqueda (query)
    const filter = query ? { category: query } : {};

    // Aplicar el criterio de ordenamiento si se proporcionó
    if (sort === 'asc') {
        options.sort = { price: 1 }; // Orden ascendente por precio
    } else if (sort === 'desc') {
        options.sort = { price: -1 }; // Orden descendente por precio
    }

    try {
        const categories = await ProductModel.distinct("category");
        const productos = await ProductModel.paginate(filter, options);

        const productosResultadoFinal = productos.docs.map(producto => {
            const {_id, ...rest} = producto.toObject();
            return rest;
        });

        // Calcular los enlaces directos a las páginas previas y siguientes, manteniendo los parámetros de consulta y orden
        const prevLink = productos.hasPrevPage ? `/api/products?limit=${limit}&page=${productos.prevPage}&sort=${sort}&query=${query}` : null;
        const nextLink = productos.hasNextPage ? `/api/products?limit=${limit}&page=${productos.nextPage}&sort=${sort}&query=${query}` : null;

        res.render("cartelera", { 
            status: 'success',
            payload: {
                productos: productosResultadoFinal,
                pagination: {
                    hasPrevPage: productos.hasPrevPage,
                    hasNextPage: productos.hasNextPage,
                    prevPage: productos.prevPage,
                    nextPage: productos.nextPage,
                    currentPage: productos.page,
                    totalPages: productos.totalPages,
                    prevLink,
                    nextLink
                },
                categories: categories
            },
            session: req.session
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ status: 'error', message: "Error interno del servidor" });
    }
});

router.get("/products/:pid", async (req, res) => {

    const id = req.params.pid;

    try {

        const producto = await productManager.getProductById(id);
        if (!producto) {
            return res.json({
                error: "Producto no encontrado"
            });
        }

        res.json(producto);
    } catch (error) {
        console.error("Error al obtener producto", error);
        res.status(500).json({
            error: "Error interno del servidor"
        });
    }
});

router.post("/products", async (req, res) => {
    const nuevoProducto = req.body; 

    try {
        await productManager.addProduct(nuevoProducto);
        res.status(201).json({message: "Producto agregado exitosamente"});
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"});
    }
});

router.put("/products/:pid", async (req, res) => {
    const id = req.params.pid;
    const productoActualizado = req.body; 

    try {
        await productManager.updateProduct(id, productoActualizado);
        res.json({
            message: "Producto actualizado correctamente"
        });
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"});
    }
});

router.delete("/products/:pid", async (req, res) => {
    const id = req.params.pid; 

    try {
        await productManager.deleteProduct(id);
        res.json({
            message: "Producto eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({error: "Error interno del servidor"});
    }
});

module.exports = router;
