
const Role = require('../models/role');
const Usuario = require('../models/usuario');
const Cliente = require('../models/cliente');
const Proveedor = require('../models/proveedor');
const Deudor = require('../models/deudor');



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

// Verificar si existe el ID de tal USUARIO
const existeUsuarioPorID = async(id = '') => {
    const existeUsuario = await Usuario.findById( id );

    if( !existeUsuario ){
        throw new Error(`El id especificado (${id}) no existe `);
    }
} 


// Verificar si existe el ID  de tal CLIENTE
const existeClientePorID = async(id = '') => {
    const existeCliente = await Cliente.findById( id );

    if( !existeCliente ){
        throw new Error(`El id especificado (${id}) no existe `);
    }
} 


// Verificar si existe el ID  de tal PROVEEDOR
const existeProveedorPorID = async(id = '') => {
    const existeProveedor = await Proveedor.findById( id );

    if( !existeProveedor ){
        throw new Error(`El id especificado (${id}) no existe `);
    }
} 

const yaTieneDeudas = async(cliente) => {
    const { historial } = await Deudor.findOne({ cliente  }) || { "historial": [] };
    
    return [...historial]; 
}


module.exports = {
    esRoleValido,
    emailExiste,
    existeUsuarioPorID,
    existeClientePorID,
    existeProveedorPorID,
    yaTieneDeudas
}