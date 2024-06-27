const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const initializePassport = require("./config/passport.config.js");
const cors = require("cors");
const path = require('path');
const PUERTO = 8080;
require("./database.js");
const { addLogger } = require("./utils/loggers.js"); 

const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");
const userRouter = require("./routes/user.router.js");

const usuariosRouter = require("./routes/user.router.js");
const manejadorError = require("./middleware/error.js");

// Middleware para análisis de URL y JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Middleware
app.use(addLogger); 

// Ruta para testear winston
app.get("/loggertest", (req, res) => {
    req.logger.http("Mensaje HTTP");
    req.logger.info("Mensaje INFO");
    req.logger.warning("Mensaje WARNING");
    req.logger.error("Mensaje ERROR");

    res.send("Logs generados");
});

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Passport 
app.use(passport.initialize());
initializePassport();
app.use(cookieParser());

// AuthMiddleware
const authMiddleware = require("./middleware/authmiddleware.js");
app.use(authMiddleware);

// Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, 'views'));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/", viewsRouter);
app.use("/usuarios", usuariosRouter)
app.use(manejadorError);

// Nueva ruta para renderizar la vista de checkout
app.get("/checkout", (req, res) => {
    res.render("checkout");
});

const httpServer = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

// Websockets
const SocketManager = require("./sockets/socketmanager.js");
new SocketManager(httpServer);
