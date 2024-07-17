const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller.js");
const productController = new ProductController();
const checkUserRole = require("../middleware/checkrole.js");

router.get("/", checkUserRole(['admin', 'premium']), productController.getProducts);
router.get("/:pid", checkUserRole(['admin', 'premium']), productController.getProductById);
router.post("/", checkUserRole(['admin']), productController.addProduct);
router.put("/:pid", checkUserRole(['admin']), productController.updateProduct);
router.delete("/:pid", checkUserRole(['admin']), productController.deleteProduct);

module.exports = router;