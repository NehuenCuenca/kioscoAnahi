import { cerrarSesion, traerDatosAPI } from './funciones.js';
import { btnLogout } from './variables.js';


document.addEventListener('DOMContentLoaded', async() =>{
    registrarEventListeners();

    const { total, deudores } = await traerDatosAPI('deudores');

    imprimirDeudores(total, deudores)

});


function imprimirDeudores(total, deudores) {
    deudores.forEach( (deudor,i) => {
        const { cliente : { nombre, apellido }, deudaTotal, historial } = deudor;
        const blockDeudores = document.querySelector('#blockDeudores');
        
        const blockDeuda = document.createElement('div');
        blockDeuda.innerHTML = `
            <h1> ${nombre.toUpperCase()} ${apellido.toUpperCase()}</h1>
            <h4> ${deudaTotal}</h4>
            <button type="button" id="btnVerDeudas${i}" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Ver deudas
            </button>
        
            <hr>

            <div class="modal fade" id="modalDeudas${i}" tabindex="-1" aria-labelledby="modalDeudas${i}Label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalDeudas${i}Label">Modal title</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ...
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="btnCerrarModalDeudas${i}" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        const btnsVerDeuda = blockDeuda.querySelector(`#btnVerDeudas${i}`);

        btnsVerDeuda.addEventListener('click', () => {

            const body = document.querySelector('body');
            body.classList.add('modal-open');
            body.style.overflow="hidden"; 
            body.style.paddingRight="17px"; 

            const modalDeudas = blockDeuda.querySelector(`#modalDeudas${i}`);
            modalDeudas.addEventListener('click', (e) => {
                if(e.target.id === `modalDeudas${i}`){
                    body.classList.remove('modal-open');
                    body.style='';

                    modalDeudas.classList.remove('show');
                    modalDeudas.style.display = 'none';
                    modalDeudas.removeAttribute('role');
                    modalShadow.remove();
                }
            });

            modalDeudas.classList.add('show');
            modalDeudas.style.display = 'block';
            modalDeudas.role = 'dialog';

            const btnCerrarModal = document.querySelector(`#btnCerrarModalDeudas${i}`);
            btnCerrarModal.addEventListener('click', () => {
                body.classList.remove('modal-open');
                body.style='';

                modalDeudas.classList.remove('show');
                modalDeudas.style.display = 'none';
                modalDeudas.removeAttribute('role');
                modalShadow.remove();
            });

            const modalShadow = document.createElement('div');
            modalShadow.classList.add('modal-backdrop', 'fade', 'show');

            body.appendChild(modalShadow);
        })

        blockDeudores.appendChild( blockDeuda );
    });

}



function registrarEventListeners(){
    btnLogout.addEventListener('click', cerrarSesion);
}