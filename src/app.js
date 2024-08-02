import express from "express";
const app = express();
import exphbs from "express-handlebars";
import cookieParser from "cookie-parser";
import passport from "passport";
import initializePassport from "./config/passport.config.js";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUERTO = process.env.PUERTO || 8080;

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
import userRouter from "./routes/user.router.js";


//Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("./src/public"));

app.use(cors());

//Passport 
app.use(passport.initialize());
initializePassport();
app.use(cookieParser());

//AuthMiddleware
import authMiddleware from "./middleware/authmiddleware.js";

app.use(authMiddleware);


//Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");


//Rutas: 
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/users", userRouter);
app.use("/", viewsRouter);

const httpServer = app.listen(PUERTO, () => {
    console.log(`Servidor escuchando en el puerto ${PUERTO}`);
});

///Websockets: 
import SocketManager from "./sockets/socketmanager.js";

new SocketManager(httpServer);

//SWAGGER: 

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';


//objeto de configuración: swaggerOptions
const swaggerOptions = {
    definition: {
        openapi: "3.0.1",
        info: {
            title: "Documentacion de la App Tienda Marolio",
            description: "E-commerce"
        }
    },
    apis: ["./src/docs/**/*.yaml"]
}

//Swagger a nuestro servidor de Express
const specs = swaggerJSDoc(swaggerOptions);
app.use("/apidocs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));


