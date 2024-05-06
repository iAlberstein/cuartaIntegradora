const mongoose = require("mongoose"); 

mongoose.connect("mongodb+srv://albersteinbruno:kFNVu7j4qmGUJP3h@cluster0.rlnbv8w.mongodb.net/E-commerce?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log("Conectado a la DB"))
    .catch((error) => console.log("Error al conectad a la DB:", error))