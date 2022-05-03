const { response } = require("express");
const Usuario = require('../models/usuario');
const bcryptjs = require('bcryptjs');
const { generarJWT } = require("../helpers/generar-jwt");

const login = async( req, res = response ) => {

    const { correo, password } = req.body;

    try {
     
        // verificar si el email existe
        const usuario = await Usuario.findOne({ correo });
        if( !usuario ){
            return res.status(400).json({
                msg: "Usuario / password no son correctos - CORREO"
            });
        }


        // verificar q el usuario este activo (no borrado)
        if( !usuario.estado ){
            return res.status(400).json({
                msg: "Usuario / password no son correctos - estado: FALSE"
            });
        }


        // Verificar la password
        const passwordValidado = bcryptjs.compareSync( password, usuario.password);
        if( !passwordValidado ){
            return res.status(400).json({
                msg: "Usuario / password no son correctos - Password incorrecto"
            });
        }

        // Generar el token
        const token = await generarJWT( usuario.id );
        
        // Guardo el token en la BD
        usuario.token = token
        const usuarioConToken = await Usuario.findOneAndUpdate( usuario.id, { ...usuario } );

        res.json({
            msg: 'Sesion iniciada correctamente',
            usuario,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Hable con el administrador"
        });
    }
}

const logout = async( req, res = response ) => {
    const token = req.headers['x-token'];

    try {
        // Busco el usuario por su token y si retorna null ( es porque el usuario no tiene guardado un token en la BD)..
        const usuario = await Usuario.findOne({ token });
        if( !usuario ){
            res.status(400).json({
                msg: "Error - no hay token (la sesion ya se encuentra cerrada..)"
            });
        }

        // Si lo encuentra, borro el token de la BD..
        usuario.token = '';
        await Usuario.findOneAndUpdate( usuario.id, { ...usuario } );

        res.json({
            msg: "Sesion cerrada exitosamente"
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "Error inesperado - la sesion no pudo cerrarse.."
        });
    }
    
}

module.exports = {
    login,
    logout
}