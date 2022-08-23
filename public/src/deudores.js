
import { actualizarDatosAPI, cerrarSesion, eliminarDatosAPI, enviarDatosAPI, traerDatosAPI, traerDatosPorIdAPI, validarTokenAPI } from './funciones-API.js';

import { 
    crearModal,
    cerrarModal,
    crearFormVerHistorial,
    cargarSelectClientes,
    cargarSelectConArticulos,
    sumarArticuloDeuda,
    crearBtnsAccionesDeuda,
    habilitarBloqueArticulo,
    crearFormHistorialNuevo,
    vincularBtnCerrarSesion
} from './funciones-UI.js';



document.addEventListener('DOMContentLoaded', async() => {
    const respValidacionToken = await validarTokenAPI();
    if( !respValidacionToken ) { return; }
    
    registrarEventListeners();

    const { deudores } = await traerDeudores();
    imprimirDeudores( deudores );
});

function registrarEventListeners(){
    vincularBtnCerrarSesion();

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


function imprimirDeudores( deudores ) {
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

    // Creo los btns de 'editar' y 'saldar
    const btnAcciones = crearBtnsAccionesDeuda( deudorId );
    modalConsultarDeudor.querySelector('.modal-body').appendChild(btnAcciones);
    
    // btnSaldarDeuda eventListener 
    const btnSaldarDeuda = btnAcciones.querySelector('#btnSaldarDeuda');
    btnSaldarDeuda.addEventListener('click', async(e) => {
        await saldarDeuda(e); 
    });

    // btnEditarDeuda eventListener 
    const btnEditarDeuda = btnAcciones.querySelector('#btnEditarDeuda');
    btnEditarDeuda.addEventListener('click', (e) => {
        // Booleano de si existen botones deshabilitados (osea, solo uno puede ser clickeado)
        const hayDeshabilitados = Boolean( Array.from(btnAcciones.querySelectorAll('button:disabled')).length > 0 );
        
        if( hayDeshabilitados ){
            console.log('modo editar', true);
            usarModoEditar(modalConsultarDeudor);
            
            const btnGuardarEditado = modalConsultarDeudor.querySelector('#btnGuardarDeuda button');
            btnGuardarEditado.addEventListener('click', (e) => {
                e.preventDefault();
                guardarDeudaEditada(e);
            });
        } else {
            console.log('modo editar', false);

            salirModoEditar(modalConsultarDeudor);
            modalConsultarDeudor.querySelector('form').remove();
            imprimirHistorial(); 
        }
    });

    async function imprimirHistorial() {
        // Creo la estructura del historial y lo pego en el modal
        const formHistorial = crearFormVerHistorial(historial);
        modalConsultarDeudor.querySelector('.modal-body').appendChild( formHistorial );

        // cargo y seteo el select cliente
        cargarSelectClientes(formHistorial.querySelector('#blockCliente select'), await traerClientes());
        formHistorial.querySelector('#blockCliente select').value = _id;

        /* console.log( ...Array.from(formHistorial.querySelectorAll(`button[id^="btnSumarArticuloEnContra"]`) ))
        console.log( ...Array.from(formHistorial.querySelectorAll(`button[id^="btnSumarArticuloAFavor"]`) ))
        debugger */

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

            // Oculto botones y selects...
            /* toggleDisplay(
                formHistorial.querySelector(`#btnSumarArticuloEnContra${j}`).parentElement,
                formHistorial.querySelector(`#btnSumarArticuloAFavor${j}`).parentElement
            ); */

            // Identifico las columnas y les pego su contenido correspondiente
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


async function abrirModalCrearDeudor() {
    const paramsModalCrearDeudor = {
        "idModal": 'crearDeudor',
        "accion": 'Crear',
        "coleccion": 'Deudor',
        "size": 'modal-xl',
    }

    const modalCrearDeudor = crearModal( paramsModalCrearDeudor );

    // Creo el form con las columnas y lo agrego al modal
    const historialDeudaNuevo = crearFormHistorialNuevo();
    modalCrearDeudor.querySelector('.modal-body').appendChild(historialDeudaNuevo);
    
    cargarSelectClientes( modalCrearDeudor.querySelector('#listaClientes'), await traerClientes() );

    const columnaEnContra = modalCrearDeudor.querySelector('#blockEnContra');
    const columnaAFavor = modalCrearDeudor.querySelector('#blockAFavor');

    // Registro el boton de sumar articulo de cada columna
    registrarBtnSumarArticulo(columnaEnContra);
    registrarBtnSumarArticulo(columnaAFavor);

    const btnGuardarDeuda = historialDeudaNuevo.querySelector('#btnGuardarDeuda');
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
        cargarSelectConArticulos( ultimoSelect, await traerArticulos() ); 

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

    const deudasPorFecha = Array.from(modal.querySelectorAll(`div[id^=deudaNro]`));

    // FN que crea un arreglo con los valores de cada tipo de deuda
    const mapearValores = ( arrValores = [] ) => {
        let valoresMapeados = [];

        for (let i = 0; i < arrValores.length; i++) {
            const blockArticulo = arrValores[i];
    
            const articuloDeuda = {
                "articulo": blockArticulo.querySelector('#listaArticulo').value || blockArticulo.querySelector('#articuloDeuda').value || "",
                "precio": Number( blockArticulo.querySelector('#precioArticulo').value ) || 0
            }
    
            valoresMapeados = [ ...valoresMapeados, articuloDeuda ];
        }

        return valoresMapeados;
    }

    let nuevoHistorial = [];
    for (let j = 0; j < deudasPorFecha.length; j++) {
        const deudaActual = deudasPorFecha[j];

        const articulosEnContra = Array.from( deudaActual.querySelectorAll('#blockEnContra #contenidoColumna div[id^="blockArticuloDeuda"]') ) || [];
        const articulosAFavor   = Array.from( deudaActual.querySelectorAll('#blockAFavor #contenidoColumna div[id^="blockArticuloDeuda"]') )   || [];

        const objDeuda = {
            "enContra": mapearValores(articulosEnContra) || [],
            "aFavor": mapearValores(articulosAFavor) || [],
            "fecha": document.querySelector('#fechaDeuda').textContent
        }

        // Si en una fecha, los arrays estan vacios, continuo con la siguiente fecha
        const { enContra, aFavor } = objDeuda;
        if( enContra.length === 0 && aFavor.length === 0){
            continue;
        }

        nuevoHistorial = [ ...nuevoHistorial, objDeuda ];
    }

    const objDeuda = {
        cliente,
        "historial": nuevoHistorial
    }

    return objDeuda;
}


async function validarDeuda(deuda, callback) {
    const { cliente, historial } = deuda;

    // verifico que el cliente no este vacio
    if( cliente.trim().length === 0 ){
        return alert('El campo nombre es obligatorio');
    }

    if( historial.length === 0 ){
        return alert('Debes sumar articulos a la deuda para guardar..');
    }
   
    const mapearIndicesVacios = (arrayArticulos) => {
        if( arrayArticulos.length > 0 ){
            const indices = arrayArticulos.map( (art, i) => {
                const { articulo, precio } = art;

                // Si esta incompleto el "campo", retorno el indice+1, sino -1
                if( !articulo || !precio || precio === 0 ){
                    return i+1;
                } else {
                    return -1;
                }
            });

            // limpio los articulos que estan llenos
            return indices.filter( indice => indice !== -1);
        } 

        return [];
    }
    
    const verificarIndices = (enContraVacios, aFavorVacios, fecha) => {
        const existeArticuloVacio = (enContraVacios.length > 0) || (aFavorVacios.length > 0);

        if( existeArticuloVacio ){
            if( enContraVacios.length > 0 ){
                alert(`ERROR: Deuda (fecha ${fecha}): \n Los articulos ${enContraVacios} de la seccion EN CONTRA estan INCOMPLETOS`);
            } else if( aFavorVacios.length > 0  ){
                alert(`ERROR: Deuda (fecha ${fecha}): \n Los articulos ${aFavorVacios} de la SECCION A FAVOR estan INCOMPLETOS`);
            } 

            return false;
        }

        return true;
    }

    let tieneVacios = false;
    for (let i = 0; i < historial.length; i++) {
        const { enContra, aFavor, fecha } = historial[i];

        const articuloVacioEnContra = mapearIndicesVacios(enContra);
        const articuloVacioAFavor   = mapearIndicesVacios(aFavor);

        if( !verificarIndices(articuloVacioEnContra, articuloVacioAFavor, fecha) ){
            tieneVacios = !tieneVacios;
            break;
        }
    }

    if( !tieneVacios ){
        callback(deuda);
    }
}

async function actualizarDeuda(deudaActualizada) {
    try {
        const deudorId = document.querySelector('#btnEditarDeuda').getAttribute('data-deuda');
        const { resp, data } = await actualizarDatosAPI('deudores', deudorId, deudaActualizada);
        if(resp.status === 200){
            console.log('Se editó el deudor exitosamente');
            const modalActual = document.querySelector('div.modal.fade.show');
            cerrarModal(modalActual.id);
        
            const { deudores } = await traerDeudores();
            imprimirDeudores(deudores);
        }
    } catch (error) {
        console.log('No se pudo guardar el deudor, razon: ', error);
        alert(error);
    }
}


async function guardarDeudaAPI(deuda) {
    try {
        const { resp, data } = await enviarDatosAPI('deudores', deuda);
        if( resp.status === 200 ){
            console.log('Se guardó el deudor exitosamente');
            const modalActual = document.querySelector('div.modal.fade.show');
            cerrarModal(modalActual.id);
        
            const { deudores } = await traerDeudores();
            imprimirDeudores( deudores );
        }
    } catch (error) {
        console.log('No se pudo guardar el deudor, razon: ', error);
        alert(error);
    }
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
        ...Array.from(bodyModal.querySelectorAll('button[id^=btnSumarArticuloEnContra]')),
        ...Array.from(bodyModal.querySelectorAll('button[id^=btnSumarArticuloAFavor]')),
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

    const deudasPorFecha = Array.from(modal.querySelectorAll(`div[id^=deudaNro]`));
        
    // muestro btn guardar, y btn sumar Articulos
    toggleDisplay(
        bodyModal.querySelector('#btnGuardarDeuda'),
        ...Array.from(bodyModal.querySelectorAll('button[id^=btnSumarArticuloEnContra]')),
        ...Array.from(bodyModal.querySelectorAll('button[id^=btnSumarArticuloAFavor]')),
    );

    for (let i = 0; i < deudasPorFecha.length; i++) {
        const contenidoColEnContra = deudasPorFecha[i].querySelector('#blockEnContra #contenidoColumna');
        const contenidoColAFavor = deudasPorFecha[i].querySelector('#blockAFavor #contenidoColumna');

        habilitarInputs(contenidoColEnContra, false);
        habilitarInputs(contenidoColAFavor, false);

        registrarBtnSumarArticulo(contenidoColEnContra.parentElement);
        registrarBtnSumarArticulo(contenidoColAFavor.parentElement);
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


// fn que elimina la deuda de la BD
async function saldarDeuda(e) {
    const deudorId = e.target.getAttribute('data-deuda');

    const confirmBorrarDeudor = confirm('¿Estas seguro de saldar esta deuda? Se eliminaran todos sus datos.');
    if( confirmBorrarDeudor ){
        try {
            const { resp, data : {msg} } = await eliminarDatosAPI('deudores', deudorId);
            if( resp.status === 200 ){
                alert(msg);

                const { deudores } = await traerDeudores();
                imprimirDeudores( deudores );
                return true;
            }
        } catch (error) {
            console.log('No se pudo eliminar el deudor, razon: ', error);
            alert('No se pudo eliminar el deudor, razon: ', error);
        }
    }

    return false;
}
