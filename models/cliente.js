const { Schema, model } = require('mongoose'); 

const ClienteSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido']
    },
    direccion: {
        type: String,
        default: '--'
    },
    telefono: {
        type: String,
        default: '--'
    },
    estado: {
        type: Boolean,
        default: true,
    }
});

ClienteSchema.methods.toJSON = function() {
    const { __v, ...cliente } = this.toObject();   
    return cliente;
}


module.exports = model( 'Cliente', ClienteSchema );