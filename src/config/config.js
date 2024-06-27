// Requiere dotenv-flow para cargar variables de entorno desde múltiples archivos .env
const dotenvFlow = require('dotenv-flow');
const argv = require('yargs').argv;

const mode = argv.mode || 'desarrollo';

dotenvFlow.config({
    node_env: mode
});

const configObject = {
    node_env: process.env.NODE_ENV || 'development',
    // Aquí puedes añadir más configuraciones si es necesario
};

module.exports = configObject;
