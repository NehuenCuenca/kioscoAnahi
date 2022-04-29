const { Schema, model } = require('mongoose'); 

const ProveedorSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es requerido']
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es requerido']
    },
    telefono: { type: String, default: '--' },
    direccion: { type: String, default: '--' },
    empresa: { type: String, default: '--' },
    descripcion: { type: String, default: '--' },
    estado: { type: Boolean, default: true }
});

ProveedorSchema.methods.toJSON = function() {
    const { __v, ...proveedor } = this.toObject();  
    return proveedor;
}

module.exports = model( 'Proveedor', ProveedorSchema );