const express = require("express");
const router = express.Router();
const UserModel = require("../models/user.model.js");
const passport = require("passport");

router.post("/", passport.authenticate("register", {failureRedirect: "/failedregister"}), async (req, res) => {
    if(!req.user) return res.status(400).send({status:"error"});

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email:req.user.email,
        role: req.body.role,  // Asignar el valor del rol proporcionado en el formulario
        cart: req.user.cart
    };

    req.session.login = true;

    res.redirect("/profile");
})


router.get("/failedregister", (req, res) => {
    res.send({ error: "Registro fallido!" });
});

module.exports = router;
