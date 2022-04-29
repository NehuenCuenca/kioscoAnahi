const { response } = require("express");

const Deudor = require('../models/deudor');

const { calcularDeudaTotal, calcularDeudaTotal2 } = require('../helpers/contar-deudas');


const obtenerDeudores = async( req, res = response ) => {
    const { limite = 5, desde = 0 } = req.query;
    const queryActivos = { estado: true };

    const [ total, deudores ] = await Promise.all([
        Deudor.countDocuments( queryActivos ),
        Deudor.find( queryActivos )
                .populate('cliente', ['nombre', 'apellido'])
                .populate({ 
                    path: 'historial',
                    populate: {
                      path: 'enContra && aFavor',
                      populate: {
                        path: 'articulo',
                        model: 'Articulo',
                        select: 'nombre'
                      } 
                    } 
                })
                .limit( Number(limite) )
                .skip( Number(desde) )
    ]);

    res.json({ 
        msg: 'Lista de deudores exitosa',
        total,
        deudores
    });
}


const obtenerDeudor = async( req, res = response ) => {
    const { id } = req.params;

    const deudor = await Deudor.findById( id )
                            .populate('cliente', ['nombre', 'apellido'])
                            .populate({ 
                                path: 'historial',
                                populate: {
                                  path: 'enContra && aFavor',
                                  populate: {
                                    path: 'articulo',
                                    model: 'Articulo',
                                    select: 'nombre'
                                  } 
                                } 
                            });

    res.json({ 
        msg: `obtener deudor ${id}`,
        deudor
    });
}


const crearDeudor = async( req, res = response ) => {
    const { cliente, historial } = req.body;

    let deudaTotal = calcularDeudaTotal2( historial );

    const deudor = new Deudor({ cliente, historial, deudaTotal });
    await deudor.save();

    res.json({ 
        msg: "Deudor creado exitosamente",
        deudor
    });
}


const modificarDeudor = async( req, res = response ) => {
    const { id } = req.params;
    const { historial } = req.body;

    const cambios = Object.assign(req.body);
    console.log(cambios)

    let deudaTotal = calcularDeudaTotal( historial );
    cambios.deudaTotal = deudaTotal;

    const deudorActualizado = await Deudor.findByIdAndUpdate( id, cambios );

    res.json({ 
        msg: `Deudor MODIFICADO ${id} exitosamente`,
        deudorActualizado
    });
}


const eliminarDeudor = async( req, res = response ) => {
    const { id } = req.params;

    const deudorEliminado = await Deudor.findByIdAndRemove( id ); 

    res.json({ 
        msg: `Deudor ELIMINADO ${id} exitosamente.`,
        deudorEliminado
    });
}





module.exports = {
    obtenerDeudores,
    obtenerDeudor,
    crearDeudor,
    modificarDeudor,
    eliminarDeudor
}