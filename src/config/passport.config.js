//Instalamos: npm i passport passport-local

//Importamos los módulos: 
const passport = require("passport");
const local = require("passport-local");
const UserModel = require("../models/user.model.js");
const { createHash, isValidPassword } = require("../utils/hashbcryp.js");

const LocalStrategy = local.Strategy; 

const initializePassport = () => {
    passport.use("register", new LocalStrategy({
        passReqToCallback: true,
        usernameField: "email"
    }, async (req, email, password, done) => {
        const { first_name, last_name, age, role } = req.body; 
    
        try {
            //Verificamos si ya existe un registro con ese mail
            let user = await UserModel.findOne({ email: email });
            if (user) return done(null, false);
            //Si no existe, voy a crear un registro nuevo: 
            let newUser = {
                first_name,
                last_name,
                email,
                age,
                role, // Asignar el valor del campo "role"
                password: createHash(password)
            }
    
            let result = await UserModel.create(newUser);
            return done(null, result);
        } catch (error) {
            return done(error);
        }
    }));
    

//Agregamos otra estrategia, ahora para el "login":
passport.use("login", new LocalStrategy({
    usernameField: "email"
}, async (email, password, done) => {
    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return done(null, false, { message: "Correo electrónico o contraseña incorrectos" });
        }
        if (!isValidPassword(password, user)) {
            return done(null, false, { message: "Correo electrónico o contraseña incorrectos" });
        }
        
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));
    
    
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById(id);
        done(null, user);
    });
}

module.exports = initializePassport;
