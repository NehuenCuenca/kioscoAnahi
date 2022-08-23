
import { traerDatosAPI, traerDatosPorIdAPI, validarTokenAPI } from './funciones-API.js';

import { 
    crearModal,
    crearFormVerHistorial,
    cargarSelectClientes,
    cargarSelectConArticulos,
    sumarArticuloDeuda,
    habilitarBloqueArticulo,
} from './funciones-UI.js';



document.addEventListener('DOMContentLoaded', async() => {    
    const { total, deudores } = await traerDeudores();
    
    imprimirDeudores(total, deudores);
});


async function traerDeudores(){
    const paramsRequestDeudores = {
        controller: 'deudores',
        limite: null,
        desde: null,
        filtro: '',
    }

    const { resp, data } = await traerDatosAPI(paramsRequestDeudores);
    
    if( resp.status !== 200 ){
        return alert('Algo falló al tratar de traer los deudores..');
    }

    return data; 
}


function limpiarDeudores() {
    const blockDeudores = document.querySelector('#blockDeudores');
    while( blockDeudores.firstChild ){
        blockDeudores.removeChild( blockDeudores.firstChild );
    }
}


function imprimirDeudores(total, deudores) {
    limpiarDeudores();

    deudores.forEach( (deudor,i) => {
        const { cliente : { nombre, apellido }, deudaTotal, _id } = deudor;
        const nombreDeudorCompleto = `${nombre.toUpperCase()} ${apellido.toUpperCase()}`;
        const blockDeudores = document.querySelector('#blockDeudores');

        const colorTotal = (deudaTotal > 0) ? 'text-danger' : 'text-success';

        const blockDeuda = document.createElement('div');
        blockDeuda.classList.add('row', 'my-3');
        blockDeuda.innerHTML = `
            <div class="row mb-4"> 
                <h1 class="col col-6"> ${nombreDeudorCompleto}</h1>
                <h4 class="col col-4 ${colorTotal}"> Total: ${deudaTotal}</h4>
            </div> 
            
            <button type="button" id="btnVerDeudas${i}" data-deuda="${_id}" class="btn btn-info text-primary fs-5" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Ver deudas
            </button>
        `;

        const btnsVerDeuda = blockDeuda.querySelector(`#btnVerDeudas${i}`);

        btnsVerDeuda.addEventListener('click', verDeuda);

        blockDeudores.appendChild( blockDeuda );
        blockDeudores.appendChild( document.createElement('hr') );
    });

}


async function verDeuda(e) {
    const deudorId = e.target.getAttribute('data-deuda');

    const { resp, data: {deudor : {historial, cliente : {_id, nombre, apellido} } } } = await traerDatosPorIdAPI('deudores', deudorId);  

    const nombreDeudorCompleto = `${nombre.toUpperCase()} ${apellido.toUpperCase()}`;

    // creo el modal
    const paramsModalConsultarDeudor = {
        "idModal": 'consultarDeudor',
        "accion": `${ nombreDeudorCompleto }`,
        "coleccion": '',
        "size": 'modal-xl',
    }
    const modalConsultarDeudor = crearModal(paramsModalConsultarDeudor);

    
    async function imprimirHistorial() {
        // Creo la estructura del historial y lo pego en el modal
        const formHistorial = crearFormVerHistorial(historial);
        modalConsultarDeudor.querySelector('.modal-body').appendChild( formHistorial );

        // cargo y seteo el select cliente
        cargarSelectClientes(formHistorial.querySelector('#blockCliente select'), await traerClientes());
        formHistorial.querySelector('#blockCliente select').value = _id;

        // Oculto select cliente y btnGuardarDeuda
        toggleDisplay(
            formHistorial.querySelector('#blockCliente'),
            formHistorial.querySelector('#btnGuardarDeuda'),
            ...Array.from(formHistorial.querySelectorAll(`button[id^="btnSumarArticuloEnContra"]`) ),
            ...Array.from(formHistorial.querySelectorAll(`button[id^="btnSumarArticuloAFavor"]`) )
        );  

        // Recorro por cada fecha que haya una deuda
        for (let j = 0; j < historial.length; j++) {
            const { aFavor, enContra } = historial[j];
            const deudaActualForm = formHistorial.querySelector(`#deudaNro${j}`);

            const enContraBlock = deudaActualForm.querySelector('#blockEnContra');
            const aFavorBlock = deudaActualForm.querySelector('#blockAFavor');
            
            const contenidoEnContra = enContraBlock.querySelector('#contenidoColumna');
            const contenidoAFavor = aFavorBlock.querySelector('#contenidoColumna');

            enContraBlock.appendChild(contenidoEnContra);
            aFavorBlock.appendChild(contenidoAFavor);


            // CARGO LOS INPUTS de cada columna
            const articulos = await traerArticulos();
            cargarInputs(contenidoEnContra, enContra, articulos);
            habilitarInputs(contenidoEnContra, true);
    
            cargarInputs(contenidoAFavor, aFavor, articulos);
            habilitarInputs(contenidoAFavor, true);
        }
    }

    imprimirHistorial();    
}



async function traerClientes(){
    const paramsRequestClientes = {
        controller: 'clientes',
        limite: null,
        desde: null,
        filtro: '',
    }
    const { resp, data: { clientes } } = await traerDatosAPI(paramsRequestClientes);

    const clientesLimpios = clientes.map( cliente => {
        const { estado, ...resto } = cliente;
        return { ...resto };
    })

    return clientesLimpios;
}


async function traerArticulos(){
    const paramsRequestArticulos = {
        controller: 'articulos',
        limite: null,
        desde: null,
        filtro: '',
    }
    const { resp, data: { articulos } } = await traerDatosAPI(paramsRequestArticulos);

    const articulosLimpios = articulos.map( articulo => {
        const { estado, ...resto } = articulo;
        return { ...resto };
    })

    return articulosLimpios;
}


function toggleDisplay(...params) {
    for (let i = 0; i < params.length; i++) {
        const elemento = params[i];
        if(elemento.classList.contains('displayOff')){
            elemento.classList.remove('displayOff');
        } else {
            elemento.classList.add('displayOff');
        }
    }
}


function habilitarInputs(contenidoColumna, bool) {
    const cantArticulos = contenidoColumna.childNodes.length;

    for (let i = 0; i < cantArticulos; i++) {
        const bloqueArticuloActual = contenidoColumna.querySelector(`#blockArticuloDeuda${i}`);
        habilitarBloqueArticulo(bloqueArticuloActual, bool);
    }
}


async function cargarInputs(contenidoColumna, datos, articulos) {
    for (let i = 0; i < datos.length; i++) {
        const { articulo: { _id }, precio } = datos[i];

        // creo los inputs y selects
        sumarArticuloDeuda(contenidoColumna);
        
        const bloqueArticuloActual = contenidoColumna.querySelector(`#blockArticuloDeuda${i}`);

        const selectNombreArticulo = bloqueArticuloActual.querySelector('select#listaArticulo');
        const inputPrecioArticulo  = bloqueArticuloActual.querySelector('input#precioArticulo');
        const btnBorrarArticulo = bloqueArticuloActual.querySelector('button#btnBorrarArticulo');
        btnBorrarArticulo.style.display = 'none';

        // CargarDatos
        cargarSelectConArticulos(selectNombreArticulo, articulos);
        selectNombreArticulo.value = _id;
        inputPrecioArticulo.value  = precio;
    }
}
