const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    first_name: {
        type: String, 
        required: true
    },

    last_name : {
        type: String, 
        required: true
    },

    email : {
        type: String, 
        required: true,
        index: true, 
        unique: true
    }, 

    password: {
        type: String, 
        required: true
    },

    age : {
        type: Number, 
        required: true
    },

    // Agregar campo para el rol del usuario con valor por defecto 'user'
    role: {
        type: String,
        enum: ['user', 'admin'], // Asegurarse de que el rol sea 'user' o 'admin'
        default: 'user' // Asignar 'user' como valor por defecto
    }
});

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
