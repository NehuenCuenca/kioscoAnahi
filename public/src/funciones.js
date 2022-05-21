// archivo con funciones globales

import { URL, vistas } from "./variables.js";


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
    if( vista === '' || vista === undefined || vista === null ){
        window.location.href = '/index.html';
    }
    
    window.location.href = vista;
}


// FN de logout
/* export async function cerrarSesion() {
    if( verificarToken ){
        const token = localStorage.getItem('x-token');
        console.log( JSON.stringify({ 'x-token': token }) )

        const resp = await fetch(`${URL}/api/auth/logout`, {
            method: 'POST',
            body: JSON.stringify({ 'x-token': token }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await resp.json();

        if( resp.status === 200 ){
            eliminarToken();
        } else {
            alert(data.msg);
        }
    } else {
        alert('No tienes un token de sesion. Inicia sesíon, por favor.');
    }
    

    redireccionar(vistas.login);
} */


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





