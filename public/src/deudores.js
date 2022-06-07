
import { actualizarDatosAPI, cerrarSesion, eliminarDatosAPI, enviarDatosAPI, traerDatosAPI, traerDatosPorIdAPI } from './funciones-API.js';

import { 
    crearModal,
    crearSombraModal,
    cerrarModal,
    crearColumnasDeudas,
    cargarSelectClientes,
    cargarSelectArticulos,
    sumarArticuloDeuda,
    crearBtnsAccionesDeuda,
    habilitarBloqueArticulo
} from './funciones-UI.js';

import { traerFecha } from './funciones.js';
import { btnLogout } from './variables.js';



document.addEventListener('DOMContentLoaded', async() =>{
    registrarEventListeners();

    const { total, deudores } = await traerDeudores();
    imprimirDeudores(total, deudores);
});

function registrarEventListeners(){
    btnLogout.addEventListener('click', cerrarSesion);

    const btnCrearDeudor = document.querySelector('#btnCrearDeudor');
    btnCrearDeudor.addEventListener('click', abrirModalCrearDeudor);
}



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
                <button type="button" id="btnSaldarDeudas${i}" data-deuda="${_id}" class="btn btn-sm btn-warning col-1 fw-bold text-uppercase"> Saldar </button>
            </div> 
            
            <button type="button" id="btnVerDeudas${i}" data-deuda="${_id}" class="btn btn-info text-primary fs-5" data-bs-toggle="modal" data-bs-target="#exampleModal">
                Ver deudas
            </button>
        `;

        const btnsVerDeuda = blockDeuda.querySelector(`#btnVerDeudas${i}`);
        const btnSaldarDeuda = blockDeuda.querySelector(`#btnSaldarDeudas${i}`);


        btnsVerDeuda.addEventListener('click', verDeuda);
        btnSaldarDeuda.addEventListener('click', saldarDeuda);

        blockDeudores.appendChild( blockDeuda );
        blockDeudores.appendChild( document.createElement('hr') );
    });

}


async function verDeuda(e) {
    const deudorId = e.target.getAttribute('data-deuda');

    const { resp, data: {deudor : {historial, cliente : {_id,nombre, apellido}}} } = await traerDatosPorIdAPI('deudores', deudorId);  

    const nombreDeudorCompleto = `${nombre.toUpperCase()} ${apellido.toUpperCase()}`;

    // creo el modal
    const paramsModalConsultarDeudor = {
        "idModal": 'consultarDeudor',
        "accion": `${ nombreDeudorCompleto }`,
        "coleccion": '',
        "size": 'modal-xl',
    }
    const modalDeudor = crearModal(paramsModalConsultarDeudor);

    // Creo los btns de 'editar' y 'saldar
    const btnAcciones = crearBtnsAccionesDeuda( deudorId );
    modalDeudor.querySelector('.modal-body').appendChild(btnAcciones);
    
    // btnSaldarDeuda eventListener 
    const btnSaldarDeuda = btnAcciones.querySelector('#btnSaldarDeuda');
    btnSaldarDeuda.addEventListener('click', (e) => {
        if( !saldarDeuda(e) ){
            cerrarModal(modalDeudor.id);
        }
    });

    // btnEditarDeuda eventListener 
    const btnEditarDeuda = btnAcciones.querySelector('#btnEditarDeuda');
    btnEditarDeuda.addEventListener('click', (e) => {
        // Booleano de si existen botones deshabilitados (osea, solo uno puede ser clickeado)
        const hayDeshabilitados = Boolean( Array.from(btnAcciones.querySelectorAll('button:disabled')).length > 0 );
        
        if( hayDeshabilitados ){
            console.log('modo editar', true);
            usarModoEditar(modalDeudor);
            
            const btnGuardarEditado = modalDeudor.querySelector('#btnGuardarDeuda button');
            btnGuardarEditado.addEventListener('click', (e) => {
                e.preventDefault();
                guardarDeudaEditada(e);
            });
        } else {
            console.log('modo editar', false);

            salirModoEditar(modalDeudor);
            modalDeudor.querySelector('form').remove();
            imprimirHistorial(); 
        }
    });

    async function imprimirHistorial() {
        for (let j = 0; j < historial.length; j++) {
            const {aFavor, enContra} = historial[j];
    
            const blockDeuda = crearColumnasDeudas();

            // Borro botones y selects...
            toggleDisplay(
                blockDeuda.querySelector('#blockCliente'),
                blockDeuda.querySelector('#btnGuardarDeuda'),
                blockDeuda.querySelector('#btnSumarArticuloEnContra').parentElement,
                blockDeuda.querySelector('#btnSumarArticuloAFavor').parentElement
            );
            
            // cargo y seteo el select cliente
            cargarSelectClientes(blockDeuda.querySelector('#blockCliente select'), await traerClientes());
            blockDeuda.querySelector('#blockCliente select').value = _id;

            const enContraBlock = blockDeuda.querySelector('#blockEnContra');
            const aFavorBlock = blockDeuda.querySelector('#blockAFavor');
    
            const contenidoEnContra = enContraBlock.querySelector('#contenidoColumna');
            const contenidoAFavor = aFavorBlock.querySelector('#contenidoColumna');

            enContraBlock.appendChild(contenidoEnContra);
            aFavorBlock.appendChild(contenidoAFavor);
            modalDeudor.querySelector('.modal-body').appendChild( blockDeuda );

            // CARGO LOS INPUTS
            const articulos = await traerArticulos()
            cargarInputs(contenidoEnContra, enContra, articulos);
            habilitarInputs(contenidoEnContra, true);
    
            cargarInputs(contenidoAFavor, aFavor, articulos);
            habilitarInputs(contenidoAFavor, true);
        }
    }

    imprimirHistorial();    
}


async function abrirModalCrearDeudor() {
    const paramsModalCrearDeudor = {
        "idModal": 'crearDeudor',
        "accion": 'Crear',
        "coleccion": 'Deudor',
        "size": 'modal-xl',
    }

    const modalCrearDeudor = crearModal( paramsModalCrearDeudor );

    // Creo el form con las columnas y lo agrego al modal
    const deudaNueva = crearColumnasDeudas();
    modalCrearDeudor.querySelector('.modal-body').appendChild(deudaNueva);
    
    cargarSelectClientes( modalCrearDeudor.querySelector('#listaClientes'), await traerClientes() );

    const columnaEnContra = modalCrearDeudor.querySelector('#blockEnContra');
    const columnaAFavor = modalCrearDeudor.querySelector('#blockAFavor');

    // Registro el boton de sumar articulo de cada columna
    registrarBtnSumarArticulo(columnaEnContra);
    registrarBtnSumarArticulo(columnaAFavor);

    const btnGuardarDeuda = deudaNueva.querySelector('#btnGuardarDeuda');
    btnGuardarDeuda.addEventListener('click', guardarDeuda)
}


function registrarBtnSumarArticulo( columna )  {
    const btnSumarArticulo = columna.querySelector('button[id^="btnSumarArticulo"]');
    btnSumarArticulo.addEventListener('click', async(e) => {
        e.preventDefault();

        const contenidoCol = columna.querySelector('#contenidoColumna');
        sumarArticuloDeuda( contenidoCol );

        const ultimoBloqueArticulo = contenidoCol.querySelector('div[id^="blockArticuloDeuda"]:last-child');

        const ultimoSelect = ultimoBloqueArticulo.querySelector('select#listaArticulo');
        cargarSelectArticulos( ultimoSelect, await traerArticulos() ); 

        ultimoBloqueArticulo.querySelector('#btnBorrarArticulo').addEventListener('click', (e) => {
            ultimoBloqueArticulo.remove();
        })
    });
}


function guardarDeuda(e){
    e.preventDefault();

    const bodyModal = document.querySelector('.modal-body');
    
    // Obtener los valores de los inputs
    const objDeuda = guardarValores(bodyModal);

    // VALIDAR los valores de los inputs
    validarDeuda( objDeuda, guardarDeudaAPI );

    // TODO: MOSTRAR UN RESUMEN DE LA DEUDA
}


function guardarDeudaEditada(e){
    e.preventDefault();

    const bodyModal = document.querySelector('.modal-body');
    
    // Obtener los valores de los inputs
    const objDeuda = guardarValores(bodyModal);

    // VALIDAR los valores de los inputs
    validarDeuda( objDeuda, actualizarDeuda );
}


function guardarValores(modal){
    const cliente = modal.querySelector('#listaClientes').value || modal.querySelector('#inputCliente').value;
    
    const articulosEnContra = Array.from( modal.querySelectorAll('#blockEnContra #contenidoColumna div[id^="blockArticuloDeuda"]') );
    const articulosAFavor   = Array.from( modal.querySelectorAll('#blockAFavor #contenidoColumna div[id^="blockArticuloDeuda"]') );


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


async function validarDeuda(deuda, callback) {
    const { cliente, historial } = deuda;
    const [ {enContra, aFavor} ] = historial;

    // verifico que el cliente no este vacio
    if( cliente.trim().length === 0){
        return alert('El campo nombre es obligatorio');
    }
   
    // guardo el indice (si existe) del primer elemento que este incompleto, de cada uno de los arrays
    const articuloVacioEnContra = validarArticulos(enContra);
    const articuloVacioAFavor   = validarArticulos(aFavor);

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
        callback(deuda);
    }
}

async function actualizarDeuda(deudaActualizada) {
    try {
        const deudorId = document.querySelector('#btnEditarDeuda').getAttribute('data-deuda');
        const {resp, data} = await actualizarDatosAPI('deudores', deudorId, deudaActualizada);
        if(resp.status === 200){
            console.log('Se editó el deudor exitosamente');
            const modalActual = document.querySelector('div.modal.fade.show');
            cerrarModal(modalActual.id);
        
            const { total, deudores } = await traerDeudores();
            imprimirDeudores(total, deudores);
        }
    } catch (error) {
        console.log('No se pudo guardar el deudor, razon: ', error);
        alert(error);
    }
}


async function guardarDeudaAPI(deuda) {
    try {
        const {resp, data} = await enviarDatosAPI('deudores', deuda);
        if(resp.status === 200){
            console.log('Se guardó el deudor exitosamente');
            const modalActual = document.querySelector('div.modal.fade.show');
            cerrarModal(modalActual.id);
        
            const { total, deudores } = await traerDeudores();
            imprimirDeudores(total, deudores);
        }
    } catch (error) {
        console.log('No se pudo guardar el deudor, razon: ', error);
        alert(error);
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


function salirModoEditar(modal) {
    const bodyModal = modal.querySelector('.modal-body');
    
    const contenidoColEnContra = bodyModal.querySelector('#blockEnContra #contenidoColumna');
    const contenidoColAFavor = bodyModal.querySelector('#blockAFavor #contenidoColumna');

    toggleDisplay(
        bodyModal.querySelector('#btnGuardarDeuda'),
        bodyModal.querySelector('#btnSumarArticuloEnContra').parentElement,
        bodyModal.querySelector('#btnSumarArticuloAFavor').parentElement
    );

    habilitarInputs(contenidoColEnContra, true);
    habilitarInputs(contenidoColAFavor, true);
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


function usarModoEditar(modal) {
    const bodyModal = modal.querySelector('.modal-body');
    
    const contenidoColEnContra = bodyModal.querySelector('#blockEnContra #contenidoColumna');
    const contenidoColAFavor = bodyModal.querySelector('#blockAFavor #contenidoColumna');

    toggleDisplay(
        bodyModal.querySelector('#btnGuardarDeuda'),
        bodyModal.querySelector('#btnSumarArticuloEnContra').parentElement,
        bodyModal.querySelector('#btnSumarArticuloAFavor').parentElement
    );
    
    habilitarInputs(contenidoColEnContra, false);
    habilitarInputs(contenidoColAFavor, false);

    registrarBtnSumarArticulo(contenidoColEnContra.parentElement)
    registrarBtnSumarArticulo(contenidoColAFavor.parentElement)
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
        const {articulo: {_id}, precio} = datos[i];

        // creo los inputs y selects
        sumarArticuloDeuda(contenidoColumna);
        
        const bloqueArticuloActual = contenidoColumna.querySelector(`#blockArticuloDeuda${i}`);

        const selectNombreArticulo = bloqueArticuloActual.querySelector('select#listaArticulo');
        const inputPrecioArticulo  = bloqueArticuloActual.querySelector('input#precioArticulo');
        const btnBorrarArticulo = bloqueArticuloActual.querySelector('button#btnBorrarArticulo');
        btnBorrarArticulo.style.display = 'none';

        // CargarDatos
        cargarSelectArticulos(selectNombreArticulo, articulos);
        selectNombreArticulo.value = _id;
        inputPrecioArticulo.value  = precio;
    }
}


// fn que elimina la deuda de la BD
async function saldarDeuda(e) {
    const deudorId = e.target.getAttribute('data-deuda');

    const confirmBorrarDeudor = confirm('¿Estas seguro de saldar esta deuda? Se eliminaran todos sus datos.');
    if( confirmBorrarDeudor ){
        try {
            const { resp, data : {msg} } = await eliminarDatosAPI('deudores', deudorId);
            if(resp.status === 200){
                alert(msg);

                const { total, deudores } = await traerDeudores();
                imprimirDeudores(total, deudores);
                return true;
            }
        } catch (error) {
            console.log('No se pudo eliminar el deudor, razon: ', error);
            alert('No se pudo eliminar el deudor, razon: ', error);
        }
    }
    
    return false;
}
