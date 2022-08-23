// archivo con funciones globales

import { URL, vistas } from "./variables.js";
import { enviarDatosAPI } from './funciones-API.js'


// FN que verifica el estado  del token
export function verificarToken() {
    const token = localStorage.getItem('x-token');

    const RegExTokenJWT = /(^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$)/;

    // si es null(no existe), si fue manipulado, o si no pasa la RegEx, borro token
    if( token === null || token === '' || !RegExTokenJWT.test(token) ){
        eliminarToken();
        return false;
    } else {
        // Si el token esta 'sano' retorno true
        return true;
    }
}


// Borro token del localStorage
export function eliminarToken() {
    localStorage.removeItem('x-token');
}


// FN que redirecciona a el usuario a otra vista
export function redireccionar(vista){
    const { login } = vistas;

    if( vista === '' || vista === undefined || vista === null ){
        window.location.href = login;
    }

    window.location.href = `${window.location.origin}${vistas[vista]}`;
}

export function validarInputString(input) {
    if( input.trim().length === 0 ){
        return false;
    }
    
    return true;
}


export function traerFecha(){
    const hoy = new Date();

    const fechaFormateada = `${hoy.getDate()}-${hoy.getMonth()+1}-${hoy.getFullYear()} ${hoy.getHours()}:${hoy.getMinutes()}`;
    return fechaFormateada;
}





