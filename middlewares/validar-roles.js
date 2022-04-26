const { response } = require("express");



const esAdminRole = ( req, res = response, next ) => {

    // Si no tiene el token..
    if( !req.usuario ){
        return res.status(500).json({
            msg: 'Se quiere validar el rol sin validar el token primero'
        });
    }

    const { nombre, rol } = req.usuario;

    if( rol !== "ADMIN_ROLE" ){
        return res.status(401).json({
            msg: `${ nombre } no es administrador - no puedes hacer eso`
        });
    }

    next();
}


const tieneRole = ( ...roles ) => {
    return ( req, res = response, next ) => {
        // Si no tiene el token..
        if( !req.usuario ){
            return res.status(500).json({
                msg: 'Se quiere validar el rol sin validar el token primero'
            });
        }
        const { rol } = req.usuario;

        if( !roles.includes(req.usuario.rol) ){
            return res.status(400).json({
                msg: `El servicio requiere uno de estos roles: ${roles}. Rol actual: ${rol}`
            });
        }

        next();
    }



}



module.exports = {
    esAdminRole,
    tieneRole
}
