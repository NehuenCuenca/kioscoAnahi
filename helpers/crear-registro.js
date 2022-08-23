
const Articulo = require('../models/articulo');
const Cliente = require('../models/cliente');


// fn que recibe un nombre o un ID de un cliente y retorna el id de dicho cliente
const asignarCliente = async( cliente ) => {
    // Si se recibe un ID
    if( cliente.match(/^[0-9a-fA-F]{24}$/) ){
        // Lo busco en la BD
        const existeCliente = await Cliente.findById(cliente);
        return existeCliente._id.toString();
    }

    // Si no existe, creo un cliente rapido..
    const nuevoCliente = new Cliente({ nombre: cliente, apellido: '--', direccion: '--', telefono: '--' });
    await nuevoCliente.save();

    return nuevoCliente._id.toString();
}


const mapearIdsArticulos = async( array ) => {
    for (let i = 0; i < array.length; i++) {
        let { articulo, precio } = array[i];

        // Si no es un id..
        if( !articulo.match(/^[0-9a-fA-F]{24}$/) ){
            // Creo un articulo nuevo en la BD..
            const nuevoArticulo = new Articulo({ nombre: articulo, precio, descripcion: '--', hayStock: true });
            await nuevoArticulo.save();
    
            array[i].articulo = nuevoArticulo._id.toString();
        }
    }

    return array;
}


const crearArticuloVacios = async( historial ) => {
    let historialNuevo = [];

    for (let i = 0; i < historial.length; i++) {
        const deudaActual = historial[i];

        const { enContra, aFavor, fecha } = deudaActual;
        const deudaNueva = {
            enContra: await mapearIdsArticulos(enContra),
            aFavor: await mapearIdsArticulos(aFavor),
            fecha
        }

        historialNuevo = [...historialNuevo, deudaNueva];
    }
    
    return historialNuevo;
}


module.exports = {
    asignarCliente,
    crearArticuloVacios
}