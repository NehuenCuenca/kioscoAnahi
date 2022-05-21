const { response } = require("express");

const Proveedor = require('../models/proveedor');


const obtenerProveedores = async( req, res = response ) => {
    const { limite = 5, desde = 0 } = req.query;
    const queryActivos = { estado: true };

    const [ total, proveedores ] = await Promise.all([
        Proveedor.countDocuments( queryActivos ),
        Proveedor.find( queryActivos )
                .limit( Number(limite) )
                .skip( Number(desde) )
                .sort({ _id: 'desc' })
    ]);

    res.json({ 
        msg: 'Lista de proveedores exitosa',
        total,
        proveedores
    });
}


const obtenerProveedor = async( req, res = response ) => {
    const { id } = req.params;

    const proveedor = await Proveedor.findById( id );

    res.json({ 
        msg: `obtener Proveedor ${id}`,
        proveedor
    });
}


const crearProveedor = async( req, res = response ) => {
    const { 
        nombre, apellido, 
        descripcion = '--', telefono = '--',
        direccion   = '--', empresa  = '--'
    } = req.body;

    const proveedor = new Proveedor({ 
        nombre, apellido, descripcion,
        telefono, direccion, empresa
    });

    await proveedor.save();

    res.json({ 
        msg: "Proveedor creado exitosamente",
        proveedor
    });
}


const modificarProveedor = async( req, res = response ) => {
    const { id } = req.params;
    const { ...cambios } = req.body;

    const proveedorActualizado = await Proveedor.findByIdAndUpdate( id, cambios, { new: true } );

    res.json({ 
        msg: `Proveedor MODIFICADO ${id} exitosamente`,
        proveedorActualizado
    });
}


const eliminarProveedor = async( req, res = response ) => {
    const { id } = req.params;

    const proveedorEliminado = await Proveedor.findByIdAndUpdate( id, { estado: false } ); 

    res.json({ 
        msg: `Proveedor ELIMINADO ${id} exitosamente`,
        proveedorEliminado
    });
}



module.exports = {
    obtenerProveedores,
    obtenerProveedor,
    crearProveedor,
    modificarProveedor,
    eliminarProveedor
}