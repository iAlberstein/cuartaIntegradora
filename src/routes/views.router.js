const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("home", { session: req.session });
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
