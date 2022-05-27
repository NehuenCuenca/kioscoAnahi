
import { URL, vistas } from "./variables.js";
import { verificarToken, eliminarToken, redireccionar } from './funciones.js'



export async function traerDatosAPI( controller, limite = 100, desde = 0 ) {
    const resp = await fetch(`${URL}/api/${controller}?limite=${limite}&desde=${desde}`);
    const data = await resp.json();

    return { resp, data };
}


export async function traerDatosPorIdAPI( controller = '', id = '' ) {
    const resp = await fetch(`${URL}/api/${controller}/${id}`);
    const data = await resp.json();

    return { resp, data };
}


export async function actualizarDatosAPI( controller = '', id = '', cambios ){
    const resp = await fetch(`${URL}/api/${controller}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cambios),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await resp.json();

    return { resp, data };
}

export async function eliminarDatosAPI( controller = '', id = '' ){
    const token = localStorage.getItem('x-token');
    const resp = await fetch(`${URL}/api/${controller}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-token' : token
        }
    });

    const data = await resp.json();

    return { resp, data };
}

export async function enviarDatosAPI( controller = '', datos ){
    const token = localStorage.getItem('x-token');
    const resp = await fetch(`${URL}/api/${controller}`, {
        method: 'POST',
        body: JSON.stringify(datos),
        headers: {
            'Content-Type': 'application/json',
            'x-token' : token
        }
    });

    const data = await resp.json();

    return { resp, data };
}


export async function cerrarSesion() {
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
}

