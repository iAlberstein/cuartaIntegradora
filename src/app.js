const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const initializePassport = require("./config/passport.config.js");
const passport = require("passport");

const userRouter = require("./routes/user.router.js");
const sessionRouter = require("./routes/sessions.router.js");
const productsRouter = require("./routes/products.router.js");
const cartsRouter = require("./routes/carts.router.js");
const viewsRouter = require("./routes/views.router.js");

const exphbs = require("express-handlebars");
const socket = require("socket.io");

const app = express(); 
const PUERTO = 8080;

require("./database.js");

const { ifEqual } = require("./helpers/handlebars-helpers.js");


//Middleware
app.use(express.static("./src/public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
    secret:"secretCoder",
    resave: true, 
    saveUninitialized:true,   
    store: MongoStore.create({
        mongoUrl: "mongodb+srv://coderhouse50045:coderhouse@cluster0.fpmis3v.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0", ttl: 100
    })
}))

initializePassport();
app.use(passport.initialize());
app.use(passport.session());



//Handlebars
app.engine("handlebars", exphbs.engine({
    helpers: {
        ifEqual: ifEqual
    }
}));
app.set("view engine", "handlebars");
app.set("views", "./src/views");

//Rutas 
app.use("/api", productsRouter);
app.use("/api", cartsRouter);
app.use("/api/users", userRouter);
app.use("/api/sessions", sessionRouter);
app.use("/", viewsRouter);



const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en el puerto: ${PUERTO}`);
})

const io = require("socket.io")(httpServer);
const MessageModel = require("./models/message.model.js");
const ProductManager = require("./controllers/product-manager-db.js");

const productManager = new ProductManager("./src/models/productos.json");

io.on("connection", async (socket) => {
    console.log("Un cliente conectado");

    // Envía los productos al cliente cuando se conecta
    socket.emit("productos", await productManager.getProducts());

    // Escucha el evento "eliminarProducto"
    socket.on("eliminarProducto", async (id) => {
        await productManager.deleteProduct(id);
        // Emite los productos actualizados después de eliminar un producto
        io.emit("productos", await productManager.getProducts());
    })

    // Escucha el evento "agregarProducto"
    socket.on("agregarProducto", async (producto) => {
        await productManager.addProduct(producto);
        // Emite los productos actualizados después de agregar un producto
        io.emit("productos", await productManager.getProducts());
    })

    // Escucha el evento "message"
    socket.on("message", async (data) => {
        // Guarda el mensaje en MongoDB
        await MessageModel.create(data);
        // Obtiene los mensajes de MongoDB y los envía a todos los clientes
        const messages = await MessageModel.find();
        io.emit("message", messages);
    });
});
