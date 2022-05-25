
import { cerrarSesion, enviarDatosAPI, traerDatosAPI, traerDatosPorIdAPI } from './funciones-API.js';

import { 
    crearModal,
    crearSombraModal,
    cerrarModal,
    crearColumnasDeudas,
    cargarSelectClientes,
    cargarSelectArticulos,
    sumarArticuloDeuda
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
        const nombreDeudorCompleto = `${nombre.toUpperCase()} ${apellido.toUpperCase()}`;
        const blockDeudores = document.querySelector('#blockDeudores');

        const colorTotal = (deudaTotal > 0) ? 'text-danger' : 'text-success';

        const blockDeuda = document.createElement('div');
        blockDeuda.classList.add('row', 'my-3');
        blockDeuda.innerHTML = `
            <h1 class="col col-8"> ${nombreDeudorCompleto}</h1>
            <h4 class="col col-4 ${colorTotal}"> Total: ${deudaTotal}</h4>
            <button type="button" id="btnVerDeudas${i}" data-deuda="${_id}" class="btn btn-info text-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Ver deudas
            </button>
        `;

        const btnsVerDeuda = blockDeuda.querySelector(`#btnVerDeudas${i}`);

        btnsVerDeuda.addEventListener('click', async(e) => {

            const deudorId = e.target.getAttribute('data-deuda');

            const { resp, data: { deudor : { historial } } } = await traerDatosPorIdAPI('deudores', deudorId);            

            const modalDeudor = crearModal(`${ nombreDeudorCompleto }`);
            modalDeudor.id = 'consultarDeudor';
            modalDeudor.querySelector('.modal-dialog').classList.add('modal-xl');

            historial.forEach((deuda) => {
                const { aFavor, enContra } = deuda; 

                const blockDeuda = crearColumnasDeudas();

                // Borro botones y selects...
                blockDeuda.querySelector('#blockCliente').remove();
                blockDeuda.querySelector('#btnGuardarDeuda').remove();
                blockDeuda.querySelector('#btnSumarArticuloEnContra').parentElement.remove();
                blockDeuda.querySelector('#btnSumarArticuloAFavor').parentElement.remove();

                
                const enContraBlock = blockDeuda.querySelector('#blockEnContra');
                const aFavorBlock = blockDeuda.querySelector('#blockAFavor');
                const contenidoColumna = document.createElement('div');
                contenidoColumna.classList.add('row', 'col', 'justify-content-center', 'p-2');
                contenidoColumna.id = "contenidoColumna"
                    
                enContraBlock.appendChild(contenidoColumna);
                aFavorBlock.appendChild(contenidoColumna.cloneNode(true));

                const contenidoEnContra = enContraBlock.querySelector('#contenidoColumna')
                const contenidoAFavor = aFavorBlock.querySelector('#contenidoColumna')

                imprimirDeuda(contenidoEnContra, enContra);
                imprimirDeuda(contenidoAFavor, aFavor);

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


function imprimirDeuda(columna, arrDeudas){
    console.log(arrDeudas)

    for (let i = 0; i < arrDeudas.length; i++) {
        const { articulo : {nombre}, precio } = arrDeudas[i]; 
        
        const filaArticulo = document.createElement('div');
        filaArticulo.classList.add('row', 'justify-content-center');
        filaArticulo.textContent = `${nombre} ($${precio})`;
        columna.appendChild(filaArticulo);
    }
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

    const deudaNueva = crearColumnasDeudas();
    modalCrearDeudor.querySelector('.modal-body').appendChild(deudaNueva);
    
    cargarSelectClientes( modalCrearDeudor.querySelector('#listaClientes'), await traerClientes() );
    const columnaEnContra = modalCrearDeudor.querySelector('#blockEnContra')
    const columnaAFavor = modalCrearDeudor.querySelector('#blockAFavor')

    // BTN SUMAR ARTICULO EN CONTRA
    const btnSumarArticuloEnContra = deudaNueva.querySelector('#btnSumarArticuloEnContra');
    btnSumarArticuloEnContra.addEventListener('click', async(e) => {
        sumarArticuloDeuda( columnaEnContra );
        const ultimoBloqueArticulo = columnaEnContra.querySelector('div[id^="blockArticuloDeuda"]:last-child');

        const ultimoSelect = ultimoBloqueArticulo.querySelector('select#listaArticulo');
        cargarSelectArticulos( ultimoSelect, await traerArticulos() ); 

        ultimoBloqueArticulo.querySelector('#btnBorrarArticulo').addEventListener('click', (e) => {
            ultimoBloqueArticulo.remove();
        })
    });

    // BTN SUMAR ARTICULO A FAVOR
    const btnSumarArticuloAFavor = deudaNueva.querySelector('#btnSumarArticuloAFavor');
    btnSumarArticuloAFavor.addEventListener('click', async(e) => {
        sumarArticuloDeuda( columnaAFavor );
        const ultimoBloqueArticulo = columnaAFavor.querySelector('div[id^="blockArticuloDeuda"]:last-child');
        const ultimoSelect = ultimoBloqueArticulo.querySelector('select#listaArticulo');
        cargarSelectArticulos( ultimoSelect, await traerArticulos() ); 

        ultimoBloqueArticulo.querySelector('#btnBorrarArticulo').addEventListener('click', (e) => {
            ultimoBloqueArticulo.remove();
        })
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
    // const blockCrearDeuda = bodyModal.querySelector('#blockCrearDeuda');
    const blockCrearDeuda = bodyModal.querySelector('#listaArticuloDeudas');

    const blockNuevoArticulo = crearColumnasDeudas().querySelector('#blockArticuloDeuda'); //creo otro bloque para sumar otro articulo
    // blockNuevoArticulo.id += bodyModal.querySelectorAll('[id^="blockArticuloDeuda"]').length;
    cargarSelectArticulos( blockNuevoArticulo.querySelector('#listaArticulo'), await traerArticulos() );
    
    // blockCrearDeuda.insertBefore( blockNuevoArticulo, btnSumarViejo.parentElement ); //Agrego el bloque nuevo al Modal
    blockCrearDeuda.appendChild(blockNuevoArticulo);

    blockNuevoArticulo.querySelector('button#btnBorrarArticulo').addEventListener('click', (e) => {
        blockNuevoArticulo.remove();
    })
}

function guardarDeuda(){
    const bodyModal = document.querySelector('.modal-body');
    
    // Obtener los valores de los inputs
    const objDeuda = guardarValores(bodyModal);

    // VALIDAR LOS valores de los inputs
    validarDeuda( objDeuda );

    // GUARDAR LOS VALORES SI ESTA TODO COMPLETO

    // POSIBLE: MOSTRAR UN RESUMEN DE LA DEUDA

    // GUARDARLO Y LISTO

    
    console.log('guardando deuda')
}

function guardarValores(modal){
    const cliente = modal.querySelector('#listaClientes').value || modal.querySelector('#inputCliente').value;
    
    const articulosEnContra = Array.from( modal.querySelectorAll('#blockEnContra > div[id^="blockArticuloDeuda"]') );
    const articulosAFavor = Array.from( modal.querySelectorAll('#blockAFavor > div[id^="blockArticuloDeuda"]') );

    // FN que crea un arreglo con los valores de cada tipo de deuda
    const mapearValores = (arrValores = []) => {
        let valoresMapeados = [];

        for (let i = 0; i < arrValores.length; i++) {
            const blockArticulo = arrValores[i];
    
            const articuloDeuda = {
                "articulo": blockArticulo.querySelector('#listaArticulo').value || blockArticulo.querySelector('#articuloDeuda').value,
                "precio": Number( blockArticulo.querySelector('#precioArticulo').value )
            }
    
            valoresMapeados = [...valoresMapeados ,articuloDeuda ];
        }

        return valoresMapeados;
    }

    const objDeuda = {
        cliente,
        "historial": [{
            "enContra": mapearValores(articulosEnContra) || [],
            "aFavor": mapearValores(articulosAFavor) || [],
            "fecha": traerFecha()
        }]
    }

    return objDeuda;
}


async function validarDeuda(deuda) {
    const { cliente, historial } = deuda;
    const [ {enContra, aFavor} ] = historial;

    // verifico que el cliente no este vacio
    if( cliente.trim().length === 0){
        return alert('El campo nombre es obligatorio');
    }
   
    // guardo el indice (si existe) del primer elemento que este incompleto, de cada uno de los arrays
    const articuloVacioEnContra = validarArticulos(enContra);
    const articuloVacioAFavor = validarArticulos(aFavor);

    // Si alguno de los 2 arrays tiene un elemento incompleto, entonces true.. sino false
    const existeArticuloVacio = (articuloVacioEnContra > -1) || (articuloVacioAFavor > -1) ;

    if( existeArticuloVacio ){
        if( articuloVacioEnContra > -1 ){
            return alert(`El articulo nro ${articuloVacioEnContra+1} de la seccion EN CONTRA, esta incompleto, asegurese de completarlo.`);
        } else if( articuloVacioAFavor > -1 ){
            return alert(`El articulo nro ${articuloVacioAFavor+1} de la seccion A FAVOR, esta incompleto, asegurese de completa el nombre y un precio respectivo.`);
        } 
    } else {
        // Si esta todo completo, guardo la deuda en la BD
        try {
            const {resp, data} = await enviarDatosAPI('deudores', deuda);
            if(resp.status === 200){
                console.log('Se guardó el deudor exitosamente')
                cerrarModal('crearDeudor');
            }
        } catch (error) {
            console.log('No se pudo guardar el deudor, razon: ', error);
            alert(error);
        }
    }
}


// Retorno el index del primer articulo especificado en la deuda que no tenga especificado su nombre o precio
function validarArticulos(arrArticulos){
    return arrArticulos.findIndex( art => {
        const { articulo, precio } = art;

        if( !articulo || !precio || precio === 0){
            return art;
        }
    });
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
