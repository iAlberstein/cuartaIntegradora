const { createHash, isValidPassword } = require("../utils/hashbcryp.js");
const UserRepository = require("../repositories/user.repository.js");
const jwt = require("jsonwebtoken");

const userRepository = new UserRepository();

class UserController {
    async register(req, res) {
        const { first_name, last_name, email, password, age } = req.body;
        try {
            const existeUsuario = await userRepository.obtenerUsuarioPorEmail(email);
            if (existeUsuario) {
                return res.status(400).send("El usuario ya existe");
            }

            const nuevoUsuario = {
                first_name,
                last_name,
                email,
                password: createHash(password),
                age
            };

            await userRepository.crearUsuario(nuevoUsuario);

            res.status(201).send("Usuario registrado exitosamente");
        } catch (error) {
            req.logger.error("Error al registrar usuario:", error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        try {
            const usuario = await userRepository.obtenerUsuarioPorEmail(email);

            if (!usuario || !isValidPassword(password, usuario.password)) {
                return res.status(401).send("Credenciales incorrectas");
            }

            const token = jwt.sign({ user: usuario }, "tu_clave_secreta", { expiresIn: "1h" });

            res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 });
            res.status(200).send("Inicio de sesión exitoso");
        } catch (error) {
            req.logger.error("Error al iniciar sesión:", error);
            res.status(500).send("Error interno del servidor");
        }
    }

    async profile(req, res) {
        const usuario = req.user;
        res.json(usuario);
    }

    async logout(req, res) {
        res.clearCookie("jwt");
        res.status(200).send("Cierre de sesión exitoso");
    }

    async admin(req, res) {
        if (req.user.role !== "admin") {
            return res.status(403).send("Acceso denegado");
        }
        res.status(200).send("Acceso de administrador");
    }

    // Funciones existentes
    async obtenerUsuarios(req, res) {
        req.logger.info("Obteniendo lista de usuarios");
        try {
            const usuarios = await userRepository.obtenerUsuarios();
            res.json(usuarios);
        } catch (error) {
            req.logger.error("Error al obtener usuarios:", error);
            res.status(500).send("Error");
        }
    }

    async obtenerUsuarioPorId(req, res) {
        const id = req.params.uid;
        req.logger.info(`Obteniendo usuario por ID: ${id}`);
        try {
            const usuario = await userRepository.obtenerUsuarioPorId(id);
            if (!usuario) {
                req.logger.warn(`Usuario no encontrado: ${id}`);
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            res.json(usuario);
        } catch (error) {
            req.logger.error(`Error al obtener usuario por ID ${id}:`, error);
            res.status(500).send("Error");
        }
    }

    async actualizarUsuario(req, res) {
        const id = req.params.uid;
        const userActualizado = req.body;
        req.logger.info(`Actualizando usuario. ID: ${id}`, userActualizado);
        try {
            if (userActualizado.password) {
                userActualizado.password = createHash(userActualizado.password);
            }
            const resultado = await userRepository.actualizarUsuario(id, userActualizado);
            res.json(resultado);
        } catch (error) {
            req.logger.error(`Error al actualizar usuario ${id}:`, error);
            res.status(500).send("Error");
        }
    }

    async eliminarUsuario(req, res) {
        const id = req.params.uid;
        req.logger.info(`Eliminando usuario. ID: ${id}`);
        try {
            const resultado = await userRepository.eliminarUsuario(id);
            res.json(resultado);
        } catch (error) {
            req.logger.error(`Error al eliminar usuario ${id}:`, error);
            res.status(500).send("Error");
        }
    }
}

module.exports = UserController;
