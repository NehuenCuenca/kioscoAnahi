const { Schema, model } = require('mongoose'); 

const ArticuloSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    precio: {
        type: Number,
        required: [true, 'El precio es requerido']
    },
    descripcion: {
        type: String,
        default: '--'
    },
    hayStock: {
        type: Boolean,
        default: true
    },
    estado: {
        type: Boolean,
        default: true
    }
});

ArticuloSchema.methods.toJSON = function() {
    const { __v, ...articulo } = this.toObject();  
    return articulo;
}


module.exports = model( 'Articulo', ArticuloSchema );