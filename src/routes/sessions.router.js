const express = require("express");
const router = express.Router();
const passport = require("passport");

// Iniciar sesión
router.post("/login", passport.authenticate("login", { failureRedirect: "/api/sessions/faillogin" }), async (req, res) => {
    if (!req.user) {
        console.log("Usuario no autenticado");
        return res.status(400).json({ error: 'Correo electrónico o contraseña incorrectos' });
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role // Establecer el rol del usuario recuperado de la base de datos
    };

    req.session.login = true;
    console.log("Usuario autenticado correctamente");

    res.status(200).json({ message: 'Inicio de sesión exitoso', session: req.session });
});



// Ruta para manejar un inicio de sesión fallido
router.get("/faillogin", async (req, res) => {
    res.status(400).json({ error: 'Correo electrónico o contraseña incorrectos. Por favor, intenta nuevamente' });
});

// Cerrar sesión
router.get("/logout", (req, res) => {
    if (req.session.login) {
        req.session.destroy();
    }
    res.redirect("/login");
});

//logueo con GitHub

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }), async (req, res) => { })

router.get("/githubcallback", passport.authenticate("github", {
    failureRedirect: "/login"
}), async (req, res) => {
    req.session.user = req.user;
    req.session.login = true;
    res.redirect("/profile");
});

router.get("/current", (req, res) => {
    if (req.session.login && req.session.user) {
        res.status(200).json({ user: req.session.user });
    } else {
        res.status(401).json({ error: 'No hay usuario autenticado' });
    }
});


module.exports = router;
