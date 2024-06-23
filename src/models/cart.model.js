const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    products: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Productos' // Aquí se asegura de que la referencia sea correcta
        },
        quantity: {
            type: Number,
            default: 1
        }
    }]
});

const CartModel = mongoose.model('Cart', cartSchema);

module.exports = CartModel;
