import { validarTokenAPI } from './funciones-API.js';
import { vincularBtnCerrarSesion } from './funciones-UI.js';


document.addEventListener('DOMContentLoaded', async() => {
    const respValidacionToken = await validarTokenAPI();
    if( !respValidacionToken ) { return; }

    registrarEventListeners();
});

function registrarEventListeners(){
    vincularBtnCerrarSesion();
}