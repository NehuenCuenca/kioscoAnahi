const { response } = require("express");

const Articulo = require('../models/articulo');


const obtenerArticulos = async( req, res = response ) => {
    const { limite = 5, desde = 0 } = req.query;
    const queryActivos = { estado: true };

    const [ total, articulos ] = await Promise.all([
        Articulo.countDocuments( queryActivos ),
        Articulo.find( queryActivos )
                .limit( Number(limite) )
                .skip( Number(desde) )
    ]);

    res.json({ 
        msg: 'Lista de articulos exitosa',
        total,
        articulos
    });
}


const obtenerArticulo = async( req, res = response ) => {
    const { id } = req.params;

    const articulo = await Articulo.findById( id );

    res.json({ 
        msg: `obtener articulo ${id}`,
        articulo
    });
}


const crearArticulo = async( req, res = response ) => {
    const { nombre, precio, descripcion = '--' } = req.body;

    const articulo = new Articulo({ nombre, precio, descripcion });
    await articulo.save();

    res.json({ 
        msg: "Articulo creado exitosamente",
        articulo
    });
}


const modificarArticulo = async( req, res = response ) => {
    const { id } = req.params;
    const { ...cambios } = req.body;

    const articuloActualizado = await Articulo.findByIdAndUpdate( id, cambios );

    res.json({ 
        msg: `Articulo MODIFICADO ${id} exitosamente`,
        articuloActualizado
    });
}


const eliminarArticulo = async( req, res = response ) => {
    const { id } = req.params;

    const articuloEliminado = await Articulo.findByIdAndUpdate( id, { estado: false } ); 

    res.json({ 
        msg: `Articulo ELIMINADO ${id} exitosamente.`,
        articuloEliminado
    });
}



module.exports = {
    obtenerArticulos,
    obtenerArticulo,
    crearArticulo,
    modificarArticulo,
    eliminarArticulo
}