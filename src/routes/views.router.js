const express = require("express");
const router = express.Router(); 
const ProductModel = require("../models/product.model");

router.get("/", (req, res) => {
    res.render("home", { session: req.session });
});

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
        const prevLink = productos.hasPrevPage ? `/products?limit=${limit}&page=${productos.prevPage}&sort=${sort}&query=${query}` : null;
        const nextLink = productos.hasNextPage ? `/products?limit=${limit}&page=${productos.nextPage}&sort=${sort}&query=${query}` : null;

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

router.get("/realtimeproducts", (req, res) => {
    // Verificar si el usuario tiene el rol de administrador
    if (!req.session.login || req.session.user.role !== 'admin') {
        // Si no es un administrador, mostrar un mensaje de error
        return res.status(403).send("Acceso denegado");
    }
    // Si es un administrador, renderizar la vista de productos en tiempo real
    res.render("realtimeproducts", { session: req.session });
});

router.get("/chat", async (req, res) => {
    res.render("chat", { session: req.session });
});

router.get("/login", (req, res) => {
    if (req.session.login) {
        return res.redirect("/profile");
    }
    res.render("login", { session: req.session });
});

router.get("/register", (req, res) => {
    if (req.session.login) {
        return res.redirect("/profile");
    }
    res.render("register", { session: req.session });
});

router.get("/profile", (req, res) => {
    if (!req.session.login) {
        return res.redirect("/login");
    }
    res.render("profile", { user: req.session.user, session: req.session });
});

module.exports = router;
