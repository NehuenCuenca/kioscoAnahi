const { response, request } = require('express');
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario');


const getUsuarios = async(req = request, res = response) => {

    //capturo los parametros que vienen de la URL, los cuales se pueden inicializar en tal valor.. 
    // const { paginado = true, registros = 15, apikey } = req.query;
    const { limite = 5, desde = 0 } = req.query;
    const query = { estado: true };

    const [ total, usuarios ] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
                .skip( Number(desde) )
                .limit( Number(limite) )
    ]);

    /* const usuarios = await Usuario.find(query)
        .skip( Number(desde) )
        .limit( Number(limite) );

    const total = await Usuario.countDocuments(query); */

    res.json({ 
        total,
        usuarios
    });
}


const postUsuarios = async(req, res = response) => {

    const body = req.body;
    const { nombre, correo, password, rol} = body;
    const usuario = new Usuario({ nombre, correo, password, rol});

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt );


    // Guardar BD
    await usuario.save();

    res.json({
        usuario
    })
}


const patchUsuarios = (req, res = response) => {

    res.json({
        msg: "patch API - controlador"
    })
}


const putUsuarios = async(req, res = response) => {

    const { id }  = req.params;
    const { _id, google, password, correo, ...resto} = req.body;

    // TODO: validar contra la BD
    if( password ){
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync( password, salt );
    }

    const usuario = await Usuario.findByIdAndUpdate( id, resto, { new: true } );

    res.json({
        msg: "put API - controlador",
        usuario,
    })
}


const deleteUsuarios = async(req, res = response) => {
    const { id } = req.params   
    const uid = req.uid;

    const usuario = await Usuario.findByIdAndUpdate( id, { estado: false } );

    res.json({
        usuario
    });
}


module.exports = {
    getUsuarios,
    postUsuarios,
    putUsuarios,
    patchUsuarios,
    deleteUsuarios,
}