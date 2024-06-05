//Instalamos: npm i passport passport-local

//Importamos los módulos: 
const passport = require("passport");
const local = require("passport-local");
const GitHubStrategy = require("passport-github2")
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

    //Estrategia con GitHub

    passport.use("github", new GitHubStrategy({
        clientID: "Iv23liLukCJP6oNzLClA",
        clientSecret: "8a85414b13471508bf9cdb819cdd7b718afbca70",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"

    }, async (accessToken, refreshToken, profile, done) => {
        console.log("Profile:", profile);
        try {
            let user = await UserModel.findOne({ email:profile._json.email});
            if(!user) {
                let newUser = {
                    first_name: profile._json.name,
                    last_name: "",
                    age: 36,
                    email: profile._json.email,
                    password: ""
                }

                let result = await UserModel.create(newUser);
                done(null, result);
            } else {
                done(null, user);
            }
        } catch (error) {
            return done(error);
        }
    }))
}

module.exports = initializePassport;