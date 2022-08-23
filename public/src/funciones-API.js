
import { URL, vistas } from "./variables.js";
import { verificarToken, eliminarToken, redireccionar } from './funciones.js'

export async function traerDatosAPI( objParams ) {
    const { controller = '', limite = 100, desde = 0, filtro = '' } = objParams;
    const filtroActual = (filtro) ? `&filtro=${filtro}` : '';
    
    const resp = await fetch(`${URL}/api/${controller}?limite=${limite}&desde=${desde}${filtroActual}`);
    const data = await resp.json();

    return { resp, data };
}


export async function traerDatosPorIdAPI( controller = '', id = '' ) {
    const resp = await fetch(`${URL}/api/${controller}/${id}`);
    const data = await resp.json();

    return { resp, data };
}


export async function actualizarDatosAPI( controller = '', id = '', cambios ){
    const token = localStorage.getItem('x-token');
    const resp = await fetch(`${URL}/api/${controller}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(cambios),
        headers: {
            'Content-Type': 'application/json',
            'x-token' : token
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
    if( verificarToken() ){
        const token = localStorage.getItem('x-token');
        console.log( JSON.stringify({ 'x-token': token }) )

        const resp = await fetch(`${URL}/api/auth/logout`, {
            method: 'POST',
            body: JSON.stringify({ 'x-token': token }),
            headers: {
                'Content-Type': 'application/json',
                'x-token': token
            }
        });
        
        const data = await resp.json();

        if( resp.status !== 200 ){
            if( data['errors'] ){
                const msgErrores = data['errors'].map((error) => `${error.msg} \n`);
                alert(msgErrores);
            } else{
                alert(data.msg);
            }
        } else {
            eliminarToken();
        }
    } else {
        alert('No tienes un token de sesion. Inicia sesíon, por favor.');
    }
    
    redireccionar('login');
}


export async function validarTokenAPI(){
    const { data: { msg, vistaRedireccion }, resp } = await enviarDatosAPI('tokens', {});

    // Si la resp no es buena...
    if( resp.status !== 200 ){
        eliminarToken();

        const vistaActual = window.location.pathname;

        // Redirecciono cuando no esta en el login
        if( vistaActual !== vistas['login'] ){
            alert(`${msg} \n Redireccionando a: ${vistaRedireccion.toUpperCase()}`);
            redireccionar(vistaRedireccion);
        }

        return false;
    }

    return true;
}