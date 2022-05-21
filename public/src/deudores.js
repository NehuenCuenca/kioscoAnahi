
import { cerrarSesion, traerDatosAPI, traerDatosPorIdAPI } from './funciones-API.js';

import { 
    crearModal,
    crearSombraModal,
    cerrarModal,
    crearBlockDeuda,
    crearBlockDeudaNueva,
    cargarSelectClientes,
    cargarSelectArticulos
} from './funciones-UI.js';

import { traerFecha } from './funciones.js';
import { btnLogout } from './variables.js';



document.addEventListener('DOMContentLoaded', async() =>{
    registrarEventListeners();

    const { total, deudores } = await traerDeudores();
    imprimirDeudores(total, deudores);
});


async function traerDeudores(){
    const { resp, data } = await traerDatosAPI('deudores');
    if( resp.status !== 200 ){
        return alert('Algo falló al traer los deudores');
    }

    return data; 
}


function imprimirDeudores(total, deudores) {
    deudores.forEach( (deudor,i) => {
        const { cliente : { nombre, apellido }, deudaTotal, _id } = deudor;
        const blockDeudores = document.querySelector('#blockDeudores');
        
        const blockDeuda = document.createElement('div');
        blockDeuda.classList.add('row', 'my-3');
        blockDeuda.innerHTML = `
            <h1 class="col col-8"> ${nombre.toUpperCase()} ${apellido.toUpperCase()}</h1>
            <h4 class="col col-4"> Total: ${deudaTotal}</h4>
            <button type="button" id="btnVerDeudas${i}" data-deuda="${_id}" class="btn btn-info text-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Ver deudas
            </button>
        `;

        const btnsVerDeuda = blockDeuda.querySelector(`#btnVerDeudas${i}`);

        btnsVerDeuda.addEventListener('click', async(e) => {

            const deudorId = e.target.getAttribute('data-deuda');

            const { resp, data: { deudor : { historial }} } = await traerDatosPorIdAPI('deudores', deudorId);

            const modalDeudor = crearModal('', `${ nombre } ${apellido}`);
            modalDeudor.id = 'consultarDeudor';
            modalDeudor.querySelector('.modal-dialog').classList.add('modal-xl');



            historial.forEach((deuda) => {
                const { aFavor, enContra } = deuda; 

                const blockDeuda = crearBlockDeuda();

                const fechaDeuda  = blockDeuda.querySelector('#fechaDeuda');
                const aFavorBlock = blockDeuda.querySelector('#aFavor');
                const enContraBlock = blockDeuda.querySelector('#enContra');

                fechaDeuda.textContent = `${deuda.fecha}`;
                for (let k = 0; k < aFavor.length; k++) {
                    aFavorBlock.textContent += `${aFavor[k].articulo.nombre} ($${aFavor[k].precio}), `;                    
                }
                
                for (let j = 0; j < enContra.length; j++) {
                    enContraBlock.textContent += `${enContra[j].articulo.nombre} ($${enContra[j].precio}), `;                    
                }

                modalDeudor.querySelector('.modal-body').appendChild( blockDeuda );
            });

            // Inserto el modal antes de la etiqueta <script>
            const body = document.querySelector('body');
            body.insertBefore( modalDeudor, document.querySelector('script') );
            
            body.classList.add('modal-open');
            body.style.overflow = 'hidden'; 
            body.style.paddingRight = '17px'; 

            // Creo la sombra o fondo negro detas del modal
            const sombraModal = crearSombraModal();
            body.appendChild( sombraModal );

            // Cierro el modal si aprieta el btn cerrar o la sombraModal
            document.querySelector('#btnCerrarModal').addEventListener('click', (e) => {
                cerrarModal(modalDeudor.id);
            });

            modalDeudor.addEventListener('click', (e) => {
                if( e.target === modalDeudor ){
                    cerrarModal(e.target.id);
                }
            });

        })

        blockDeudores.appendChild( blockDeuda );
        blockDeudores.appendChild( document.createElement('hr') );
    });

}



function registrarEventListeners(){
    btnLogout.addEventListener('click', cerrarSesion);

    const btnCrearDeudor = document.querySelector('#btnCrearDeudor');
    btnCrearDeudor.addEventListener('click', abrirModalCrearDeudor);
}


async function abrirModalCrearDeudor() {
    const modalCrearDeudor = crearModal('Crear', 'Deudor');
    
    modalCrearDeudor.id = 'crearDeudor';
    modalCrearDeudor.querySelector('.modal-dialog').classList.add('modal-xl');

    const deudaNueva = crearBlockDeudaNueva();
    deudaNueva.querySelector('#btnBorrarArticulo').remove();
    modalCrearDeudor.querySelector('.modal-body').appendChild(deudaNueva);

    cargarSelectClientes( modalCrearDeudor.querySelector('#listaClientes'), await traerClientes() );
    cargarSelectArticulos( modalCrearDeudor.querySelector('#listaArticulo'), await traerArticulos() );

    const btnSumarArticulo = deudaNueva.querySelector('#btnSumarArticulo');
    btnSumarArticulo.addEventListener('click', (e) => {
        sumarOtroArticulo(e.target);
    });

    const btnGuardarDeuda = deudaNueva.querySelector('#btnGuardarDeuda');
    btnGuardarDeuda.addEventListener('click', guardarDeuda)

    const body = document.querySelector('body');
    body.insertBefore( modalCrearDeudor, document.querySelector('script') );
    
    body.classList.add('modal-open');
    body.style.overflow = 'hidden'; 
    body.style.paddingRight = '17px'; 

    // Creo la sombra o fondo negro detas del modal
    const sombraModal = crearSombraModal();
    body.appendChild( sombraModal );

    // Cierro el modal si aprieta el btn cerrar o la sombraModal
    document.querySelector('#btnCerrarModal').addEventListener('click', (e) => {
        cerrarModal(modalCrearDeudor.id);
    });

    modalCrearDeudor.addEventListener('click', (e) => {
        if( e.target === modalCrearDeudor ){
            cerrarModal(e.target.id);
        }
    });

}

async function sumarOtroArticulo( btnSumarViejo ) {
    // btnSumarViejo.parentElement.remove(); //elimino el btn clickeado

    const bodyModal = document.querySelector('.modal-body'); 
    const blockCrearDeuda = bodyModal.querySelector('#blockCrearDeuda')

    const blockNuevoArticulo = crearBlockDeudaNueva().querySelector('#blockArticuloDeuda'); //creo otro bloque para sumar otro articulo
    // blockNuevoArticulo.id += bodyModal.querySelectorAll('[id^="blockArticuloDeuda"]').length;
    cargarSelectArticulos( blockNuevoArticulo.querySelector('#listaArticulo'), await traerArticulos() );
    
    blockCrearDeuda.insertBefore( blockNuevoArticulo, btnSumarViejo.parentElement ); //Agrego el bloque nuevo al Modal

    blockNuevoArticulo.querySelector('button#btnBorrarArticulo').addEventListener('click', (e) => {
        blockNuevoArticulo.remove();
    })
}

function guardarDeuda(){
    const bodyModal = document.querySelector('.modal-body');

    // Deshabilito boton de sumar articulo
    const btnSumarArticulo = bodyModal.querySelector('#btnSumarArticulo');
    btnSumarArticulo.disabled = true;
    
    // Obtener los valores de los inputs
    const objDeuda = guardarValores(bodyModal);

    // VALIDAR LOS valores de los inputs
    validarDeuda(objDeuda);

    // GUARDAR LOS VALORES SI ESTA TODO COMPLETO

    // POSIBLE: MOSTRAR UN RESUMEN DE LA DEUDA

    // GUARDARLO Y LISTO

    
    console.log('guardando deuda')
}

function guardarValores(modal){

    const cliente = modal.querySelector('#listaClientes').value || modal.querySelector('#inputCliente').value;

    const blocksArticulos = Array.from( modal.querySelectorAll('#blockArticuloDeuda') );
    const arrArticulosAdeudados = [];

    for (let i = 0; i < blocksArticulos.length; i++) {
        const blockArticulo = blocksArticulos[i];

        const articuloDeuda = {
            "articulo": blockArticulo.querySelector('#listaArticulo').value || blockArticulo.querySelector('#articuloDeuda').value,
            "precio": blockArticulo.querySelector('#precioArticulo').value,
            "tipoDeuda": blockArticulo.querySelector('#selectDeuda').value
        }

        arrArticulosAdeudados.push( articuloDeuda );
    }


    const objDeuda = {
        cliente,
        "historial": [{
            "enContra": arrArticulosAdeudados.filter(deuda => deuda.tipoDeuda === 'enContra').map(deuda => {
                delete deuda['tipoDeuda'];
                return deuda;
            }),
            "aFavor": arrArticulosAdeudados.filter(deuda => deuda.tipoDeuda === 'aFavor').map(deuda => {
                delete deuda['tipoDeuda'];
                return deuda;
            }),
            "fecha": traerFecha()
        }]
    }
    

    return objDeuda;
}

function validarDeuda(deuda) {
    console.log(deuda)
}

async function traerClientes(){
    const { resp, data: { clientes } } = await traerDatosAPI('clientes');

    const clientesLimpios = clientes.map( cliente => {
        const { estado, ...resto } = cliente;
        return { ...resto };
    })

    return clientesLimpios;
}

async function traerArticulos(){
    const { resp, data: { articulos } } = await traerDatosAPI('articulos');

    const articulosLimpios = articulos.map( articulo => {
        const { estado, ...resto } = articulo;
        return { ...resto };
    })

    return articulosLimpios;
}