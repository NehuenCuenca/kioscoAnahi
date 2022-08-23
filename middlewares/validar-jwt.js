const { response } = require('express');
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');


const validarJWT = async( req, res = response, next) => {

    const token = req.header('x-token');
    // El token debe ser pasado en el HEADER
    if( !token ){
        return res.status(401).json({
            msg: "No hay token en la peticion",
            vistaRedireccion: 'login'
        });
    }


    try {
        // BUSCO AL USUARIO POR SU TOKEN
        const usuarioPorToken = await Usuario.findOne({ token });
        if( !usuarioPorToken ){ //Si no lo encuentra, retorno msj 'token no existente o viejo'
            return res.status(401).json({
                msg: "El token especificado no existe o es viejo.",
                vistaRedireccion: 'login'
            });
        }


        // Si lo encuentra, VERIFICO EL TOKEN CON EL PRIVATE KEY O QUE NO ESTE EXPIRADO..
        const { uid } = jwt.verify( token, process.env.SECRETORPRIVATEKEY );
        const usuario = await Usuario.findById( uid );

        // Si el usuario no existe..
        if( !usuario ){
            return res.status(400).json({
                msg: "Token no valido - usuario no existente en base de datos",
                vistaRedireccion: 'login'
            });
        }

        // Si el usuario existe pero esta "borrado en la BD"..
        if( !usuario.estado ){
            return res.status(400).json({
                msg: "Token no valido - usuario con estado en false",
                vistaRedireccion: 'login'
            });
        }

        req.usuario = usuario;

        next();
    } catch (error) {
        // Verifico si el token expiró
        if( error.name === 'TokenExpiredError' ){
            res.status(401).json({
                msg: "Token de sesion expirado - Inicie sesion de nuevo",
                vistaRedireccion: 'login'
            });

        // Si el token no se pudo validar por cualquier otro error..
        } else {
            res.status(401).json({
                msg: `Token no valido - ${error.name}`,
                vistaRedireccion: 'login'
            });
        }
    }
}


const validarSesionUsuario = async( req, res = response, next) => {

    const { correo } = req.body;
    try {
        const usuario = await Usuario.findOne({ correo });

        // Si el usuario ya tiene un token (ya inició sesion)..
        if( usuario.token !== '' ){
            return res.status(400).json({
                msg: "Token existente - el usuario ya inició sesion",
                vistaRedireccion: 'login'
            });
        }
        
        next(); 
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            msg: `Sucedio un error inesperado - ${error}`,
            vistaRedireccion: 'login'
        });
    }
    
}


module.exports = {
    validarJWT,
    validarSesionUsuario
}