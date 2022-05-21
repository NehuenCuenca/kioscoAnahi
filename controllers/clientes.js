const { response } = require("express");

const Cliente = require('../models/cliente');


const obtenerClientes = async( req, res = response ) => {
    const { limite = 5, desde = 0 } = req.query;
    const queryActivos = { estado: true };

    const [ total, clientes ] = await Promise.all([
        Cliente.countDocuments( queryActivos ),
        Cliente.find( queryActivos )
                .limit( Number(limite) )
                .skip( Number(desde) )
                .sort({ _id: 'desc' })
    ]);

    res.json({ 
        msg: 'Lista de clientes exitosa',
        total,
        clientes
    });
}


const obtenerCliente = async( req, res = response ) => {
    const { id } = req.params;

    const cliente = await Cliente.findById( id );

    res.json({ 
        msg: `obtener cliente ${id}`,
        cliente
    });
}


const crearCliente = async( req, res = response ) => {
    const { nombre, apellido, direccion = '--', telefono = '--'} = req.body;

    const cliente = new Cliente({ nombre, apellido, direccion, telefono });
    await cliente.save();

    res.json({ 
        msg: "Cliente creado exitosamente",
        cliente
    });
}


const modificarCliente = async( req, res = response ) => {
    const { id } = req.params;
    const { ...cambios } = req.body;

    const clienteActualizado = await Cliente.findByIdAndUpdate( id, cambios, { new: true } );

    res.json({ 
        msg: `Cliente MODIFICADO ${id} exitosamente`,
        clienteActualizado
    });
}


const eliminarCliente = async( req, res = response ) => {
    const { id } = req.params;

    const clienteEliminado = await Cliente.findByIdAndUpdate( id, { estado: false } ); 

    res.json({ 
        msg: `Cliente ELIMINADO ${id} exitosamente.`,
        clienteEliminado
    });
}





module.exports = {
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    modificarCliente,
    eliminarCliente
}