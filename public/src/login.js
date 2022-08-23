
import { URL } from './variables.js';
import { verificarToken, redireccionar } from './funciones.js';
import { mostrarMsj } from './funciones-UI.js';
import { validarTokenAPI } from "./funciones-API.js";

const login = document.querySelector('#login');

cargarEventListenners();
function cargarEventListenners() {
    document.addEventListener('DOMContentLoaded', async() => {
        if( verificarToken() ){
            const respValidacionAPI = await validarTokenAPI();
            
            if( respValidacionAPI ){ //Si el token es validado con la api, redirecciono al menu
                redireccionar('menu');
            }
        }
    });

    login.addEventListener('submit', validarLogin);
}



function validarLogin( e ) {
    e.preventDefault();

    const correo = document.querySelector('#correo');
    const password = document.querySelector('#password');
    correo.value   = 'test1@gmail.com',
    password.value = 'test1';

    if( correo.value === '' || password.value === '' ){
        mostrarMsj('danger', 'Todos los campos son obligatorios');
        return;
    }

    const datosUsuario = {
        correo : correo.value,
        password : password.value
    };

    enviarLogin( datosUsuario );
}


const enviarLogin = async( datosUsuario ) => {
    try {
        const resp = await fetch( `${URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify( datosUsuario ),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const datosSesion = await resp.json();
        console.log(datosSesion);
        
        if( resp.status === 200 ){
            const { token, msg } = datosSesion;
            
            localStorage.setItem( 'x-token', JSON.stringify(token).slice(1, -1) );
            mostrarMsj('success', msg, login);

            setTimeout(() => {
                console.log("Redireccionando al menú...");
                redireccionar('menu');
            }, 1200);
        } else {
            mostrarMsj('danger', msg, login);
        }   

    } catch (error) {   
        console.log(error);
        return error;
    }
}