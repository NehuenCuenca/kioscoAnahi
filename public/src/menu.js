import { vistas, btnLogout} from './variables.js';
import { cerrarSesion } from './funciones.js';



document.addEventListener('DOMContentLoaded', () =>{
    registrarEventListeners();
});

function registrarEventListeners(){
    btnLogout.addEventListener('click', cerrarSesion);
}