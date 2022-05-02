const { Schema, model } = require('mongoose');


const UsuarioSchema = Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio.']
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio.'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria.']
    },
    rol: {
        type: String,
        required: true,
        enum: ['ADMIN_ROLE', 'USER_ROLE', 'VENTAS_ROLE']
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: ''
    }
});

UsuarioSchema.methods.toJSON = function() {
    const { _id, __v, password, token, ...usuario } = this.toObject();    
    usuario.uid = _id;
    return usuario;
}


module.exports = model( 'Usuario', UsuarioSchema );