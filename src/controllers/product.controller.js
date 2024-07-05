const ProductRepository = require("../repositories/product.repository.js");
const productRepository = new ProductRepository();

class ProductController {

    async addProduct(req, res) {
        const nuevoProducto = req.body;
        req.logger.info("Agregando nuevo producto:", nuevoProducto);
        try {
            const resultado = await productRepository.agregarProducto(nuevoProducto);
            res.json(resultado);
        } catch (error) {
            req.logger.error("Error al agregar producto:", error);
            res.status(500).send("Error");
        }
    }

    async getProducts(req, res) {
        req.logger.info("Obteniendo lista de productos");
        try {
            let { limit = 10, page = 1, sort, query } = req.query;
            const productos = await productRepository.obtenerProductos(limit, page, sort, query);
            res.json(productos);
        } catch (error) { 
            req.logger.error("Error al obtener productos:", error);
            res.status(500).send("Error");
        }
    }

    async getProductById(req, res) {
        const id = req.params.pid;
        req.logger.info(`Obteniendo producto por ID: ${id}`);
        try {
            const buscado = await productRepository.obtenerProductoPorId(id);
            if (!buscado) {
                req.logger.warn(`Producto no encontrado: ${id}`);
                return res.json({ error: "Producto no encontrado" });
            }
            res.json(buscado);
        } catch (error) {
            req.logger.error(`Error al obtener producto por ID ${id}:`, error);
            res.status(500).send("Error");
        }
    }

    async updateProduct(req, res) {
        const id = req.params.pid;
        const productoActualizado = req.body;
        req.logger.info(`Actualizando producto. ID: ${id}`, productoActualizado);
        try {
            const resultado = await productRepository.actualizarProducto(id, productoActualizado);
            res.json(resultado);
        } catch (error) {
            req.logger.error(`Error al actualizar el producto ${id}:`, error);
            res.status(500).send("Error al actualizar el producto");
        }
    }

    async deleteProduct(req, res) {
        const id = req.params.pid;
        req.logger.info(`Eliminando producto. ID: ${id}`);
        try {
            const resultado = await productRepository.eliminarProducto(id);
            res.json(resultado);
        } catch (error) {
            req.logger.error(`Error al eliminar el producto ${id}:`, error);
            res.status(500).send("Error al eliminar el producto");
        }
    }

    async getMockingProducts(req, res) {
        req.logger.info("Generando productos de prueba");
        try {
            const products = [];
            for (let i = 0; i < 100; i++) {
                const product = generateProduct();
                products.push(product);
            }
            res.json(products);
        } catch (error) {
            req.logger.error("Error al generar productos de prueba:", error);
            res.status(500).send("Error");
        }
    }

}

module.exports = ProductController;
