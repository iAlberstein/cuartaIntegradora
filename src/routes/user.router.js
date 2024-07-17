const express = require("express");
const router = express.Router();
const passport = require("passport");
const UserController = require("../controllers/user.controller.js");

const CustomError = require('../services/errors/custom-error.js');
const generarInfoError = require('../services/errors/info.js');
const { EErrors } = require('../services/errors/enum.js');

const userController = new UserController();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", passport.authenticate("jwt", { session: false }), userController.profile);
router.post("/logout", userController.logout.bind(userController));
router.get("/admin", passport.authenticate("jwt", { session: false }), userController.admin);

router.post("/usuarios", async (req, res, next) => {
    const { nombre, apellido, email } = req.body;

    try {
        if (!nombre || !apellido || !email) {
            throw CustomError.crearError({
                nombre: "Usuario nuevo",
                causa: generarInfoError({ nombre, apellido, email }),
                mensaje: "Error al intentar crear el usuario",
                codigo: EErrors.TIPO_INVALIDO
            });
        }

        const usuario = { nombre, apellido, email };
        arrayUsuarios.push(usuario);
        res.send({ status: "success", payload: usuario });
    } catch (error) {
        next(error);
    }
});

//Nuevas rutas para 3ra integradora
router.post("/requestPasswordReset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);
router.put("/premium/:uid", userController.cambiarRolPremium);

module.exports = router;
