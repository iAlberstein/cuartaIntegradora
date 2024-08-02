import express from "express";
const router = express.Router();
import ViewsController from "../controllers/view.controller.js";
const viewsController = new ViewsController();
import checkUserRole from "../middleware/checkrole.js";
import passport from "passport";


router.get("/products", checkUserRole(['usuario', 'premium']),passport.authenticate('jwt', { session: false }), viewsController.renderProducts);

router.get("/carts/:cid", viewsController.renderCart);
router.get("/login", viewsController.renderLogin);
router.get("/register", viewsController.renderRegister);
router.get("/realtimeproducts", checkUserRole(['admin', 'premium']), viewsController.renderRealTimeProducts);
router.get("/chat", checkUserRole(['usuario']) ,viewsController.renderChat);
router.get("/", viewsController.renderHome);
router.get("/reset-password", viewsController.renderResetPassword);
router.get("/password", viewsController.renderCambioPassword);
router.get("/confirmacion-envio", viewsController.renderConfirmacion);
router.get("/panel-premium", viewsController.renderPremium);

export default router;