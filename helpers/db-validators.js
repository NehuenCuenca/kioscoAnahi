const Role = require('../models/role');
const Usuario = require('../models/usuario');

const esRoleValido = async(rol = '') => {
    const existeRol = await Role.findOne({ rol });
    if( !existeRol ){
        throw new Error(`El rol especificado (${rol}) no esta registrado en la base de datos`);
    }
}


// Verificar si el correo existe
const emailExiste = async(correo = '') => {
    const existeEmail = await Usuario.findOne({ correo });

    if( existeEmail ){
        throw new Error(`El correo especificado (${correo}) ya esta registrado`);
    }
} 

// Verificar si el correo existe
const existeUsuarioPorID = async(id = '') => {
    const existeUsuario = await Usuario.findById( id );

    if( !existeUsuario ){
        throw new Error(`El id especificado (${id}) no existe `);
    }
} 


module.exports = {
    esRoleValido,
    emailExiste,
    existeUsuarioPorID
}