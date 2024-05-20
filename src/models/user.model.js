const mongoose = require("mongoose");
const Cart = require('./cart.model');

const userSchema = mongoose.Schema({
    first_name: {
        type: String, 
        required: true
    },

    last_name : {
        type: String, 
        //required: true
    },

    email : {
        type: String, 
        required: true,
        index: true, 
        unique: true
    }, 

    password: {
        type: String, 
        //required: true
    },

    age : {
        type: Number, 
        //required: true
    },

    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts'
    },


    //Agregar campo para el rol del usuario con valor por defecto 'user'
    role: {
       type: String,
       enum: ['user', 'admin'], // Asegurarse de que el rol sea 'user' o 'admin'
       default: 'user' // Asignar 'user' como valor por defecto
    }
});

// inicializo el carrito antes de que se guarde un nuevo usuario
userSchema.pre('save', async function(next) {
    // Verificar si el usuario ya tiene un carrito asignado
    if (!this.cart) {
      try {
        // Crear un nuevo carrito y asignarlo al usuario
        const newCart = await Cart.create({ items: [] }); //inicializo con un carrito vacio
        this.cart = newCart._id;
        next();
      } catch (error) {
        next(error);
      }
    } else {
      next();
    }
  });

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
