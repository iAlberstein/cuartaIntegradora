import ProductRepository from "../repositories/product.repository.js";
const productRepository = new ProductRepository();


class ProductController {

    async addProduct(req, res) {
        console.log("Datos de req.user:", req.user); // Debugging
    
        const nuevoProducto = req.body;
        const owner = req.user ? req.user.email : 'admin'; // Verifica si req.user.email está definido
    
        console.log("Owner a asignar:", owner); // Debugging
    
        try {
            const producto = await productRepository.agregarProducto({
                ...nuevoProducto,
                owner
            });
    
            res.status(201).json(producto);
        } catch (error) {
            res.status(500).send("Error");
        }
    }
    
    
    

    async getProducts(req, res) {
        try {
            let { limit = 10, page = 1, sort, query } = req.query;
            
            let filters = {};
    
            // Filtrar productos según el rol del usuario
            if (req.user) {
                if (req.user.role === 'premium') {
                    // Usuarios premium no ven sus propios productos
                    filters.owner = { $ne: req.user.email };
                } 
                // En el futuro, podrías agregar más filtros para otros roles si es necesario.
            }
    
            const productos = await productRepository.obtenerProductos(limit, page, sort, query, filters);
            res.json(productos);
    
        } catch (error) {
            res.status(500).send("Error");
        }
    }
    
    

    async getProductById(req, res) {
        const id = req.params.pid;
        try {
            const producto = await productRepository.obtenerProductoPorId(id);

            if (!producto) {
                return res.status(404).render("404", { message: "Producto no encontrado" });
            }
            res.render("productinfo", producto );
        } catch (error) {
            res.status(500).send("Error interno del servidor");
        }
    }

    async updateProduct(req, res) {
        try {
            const id = req.params.pid;
            const productoActualizado = req.body;

            const resultado = await productRepository.actualizarProducto(id, productoActualizado);
            res.json(resultado);
        } catch (error) {
            res.status(500).send("Error al actualizar el producto");
        }
    }
    

    async deleteProduct(req, res) {
        const id = req.params.pid;
        const usuario = req.user; 

        try {
            let respuesta = await productRepository.eliminarProducto(id, usuario);

            res.json(respuesta);
        } catch (error) {
            res.status(500).send("Error al eliminar el producto");
        }
    }
    
}

export default ProductController;
