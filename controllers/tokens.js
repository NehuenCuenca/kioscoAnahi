const { response, request } = require('express');


const verificarToken = async( req, res = response ) => {
    res.status(200).json({
        "msg": 'Token valido',
        "vistaRedireccion": ''
    });
}


module.exports = {
    verificarToken
}

/* ok hice este controller porq quiero verificar el token cuando el usuario 
   usa las vistas del directorio public, las cuales me gustaria saber controlar
   por medio de un ¿middleware quizas?, el cual pregunte por la presencia de un
   token, si este existe, sirve la vista solicitada, pero sino, retorna la vista del login. 
   El problema de esto es que debo consultar este controller por cada vez que se carga una vista DESDE EL FRONTEND
   En cambio, si hay alguna forma de saber si alguien solicita una vista del directorio public DESDE EL BACKEND, creo que seria menos trabajo
   Pero como no se si existe algo asi, hago esto :) 
*/