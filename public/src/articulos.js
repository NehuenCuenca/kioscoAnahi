
import { actualizarDatosAPI, eliminarDatosAPI, enviarDatosAPI, traerDatosAPI, traerDatosPorIdAPI } from '../src/funciones-API.js';
import { crearModal, cerrarModal, crearFormArticulo, mostrarMsj, crearBtnsAccionesArticulo } from '../src/funciones-UI.js';
import { validarInputString } from './funciones.js';

document.addEventListener('DOMContentLoaded', async() => {
    registrarEventListeners();
    cargarTabla( await traerArticulos() );
});

function registrarEventListeners() {
    const btnCrearArticulo = document.querySelector('#btnCrearArticulo');
    btnCrearArticulo.addEventListener('click', crearArticulo);

    const btnVerArticuloSinStock = document.querySelector('#btnVerArticuloSinStock');
    btnVerArticuloSinStock.addEventListener('click', verTablaSinStock)
}

function verTablaSinStock(e){
    console.log('mostrando tabla de articulos sin stock...')
}

function crearArticulo(e){
    console.log('creando articulo...')

    const paramsModalCrearArticulo = {
        "idModal": 'crearArticulo',
        "accion": `crear`,
        "coleccion": 'articulo',
        "size": 'modal-lg',
    }
    const modalCrearArticulo = crearModal(paramsModalCrearArticulo);

    const bodyModal = modalCrearArticulo.querySelector('.modal-body')
    bodyModal.appendChild( crearFormArticulo() );

    const formArticulo = bodyModal.querySelector('form');

    const nombreArticuloInput = formArticulo.querySelector('#nombreArticulo');
    const precioArticuloInput = formArticulo.querySelector('#precioArticulo');
    const descripcionArticuloInput = formArticulo.querySelector('#descripcionArticulo');

    formArticulo.addEventListener('submit', (e) => {
        e.preventDefault();

        validarForm( formArticulo, async () => {
            const nuevoArticulo = {
                "nombre" : nombreArticuloInput.value,
                "precio" : precioArticuloInput.value,
                "descripcion" : descripcionArticuloInput.value,
                "hayStock": true
            }
    
            // Envio los cambios
            const { resp, data : { msg } } = await enviarDatosAPI('articulos', nuevoArticulo);

            // muestro mensaje de exito o de fallo de la accion editar..
            if( resp.status === 200 ){
                mostrarMsj('success', msg, formArticulo);
            } else {
                mostrarMsj('success', `No se pudo realizar la accion, debido al error: ${msg}`, formArticulo);
            }
    
            // cierro modal y sombra
            setTimeout( async() => {
                cerrarModal( modalCrearArticulo.id );
    
                cargarTabla( await traerArticulos() );
            }, 1200);
        } );
    });
}


async function traerArticulos(){
    const { resp, data: { articulos } } = await traerDatosAPI('articulos');

    const articulosLimpios = articulos.map( articulo => {
        const { estado, descripcion, ...resto } = articulo;
        return { ...resto };
    });

    return articulosLimpios;
}


function limpiarContenidoTabla(tabla) {
    console.log(tabla)
    const contenidoTabla = tabla.querySelector('tbody');

    while( contenidoTabla.firstChild ){
        contenidoTabla.removeChild( contenidoTabla.firstChild );
    }
}


function cargarTabla( articulos ){
    const tablaArticulos = document.querySelector('table#articulos');
    limpiarContenidoTabla(tablaArticulos);

    if( articulos.length === 0 ){
        const filaVacia = document.createElement('tr');
        filaVacia.classList.add('text-center');

        const celdaVacia = document.createElement('td');
        celdaVacia.colSpan = '10';
        celdaVacia.classList.add('fw-bold', 'py-4', 'fs-3');
        celdaVacia.textContent = 'No hay articulos, crea algunos con el boton azul de arriba'

        filaVacia.appendChild(celdaVacia);

        tablaArticulos.appendChild(filaVacia);
        return;
    }

    // Por cada articulos...
    for (let i = 0; i < articulos.length; i++) {

        // Creo una fila en la tabla
        const fila = document.createElement('tr');
        fila.classList.add('text-center', 'fs-5');

        const keysArticulo = Object.keys(articulos[i]);
        const valuesArticulo = Object.values(articulos[i]);
        
        // Por cada valueArticulo, creo una celda
        for (let j = 0; j <= valuesArticulo.length; j++) {
            const keyActual = keysArticulo[j];
            const valueActual = valuesArticulo[j];

            const celda = document.createElement('td');
            celda.textContent = valueActual;  
            celda.id = keyActual;
            if( celda.id === '_id' ) {
                celda.textContent = i+1;
            }
            
            // Cuando estemos en la llave 'hayStock'..
            if(keyActual === 'hayStock'){
                // Si 'hayStock' es false, le ponemos un font rojo y seguimos con la sig llave del obj..
                if( !valueActual ){
                    fila.classList.add('text-danger');
                }
                continue;
            }


            // Si llego al final, creo los botones Editar y Eliminar (ACCIONES)
            if( valuesArticulo.length === j ){
                const celdaAcciones = document.createElement('td');

                const btnConsultar = document.createElement('button');
                btnConsultar.classList.add('btn', 'btn-sm', 'btn-success');
                btnConsultar.textContent = 'Consultar';
                btnConsultar.addEventListener('click', verArticulo);
                btnConsultar.dataset.articulo = articulos[i]._id

                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-sm', 'btn-warning');
                btnEditar.textContent = 'Editar';
                btnEditar.addEventListener('click', editarArticulo);
                btnEditar.dataset.articulo = articulos[i]._id

                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-sm', 'btn-danger');
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.dataset.articulo = articulos[i]._id
                btnEliminar.addEventListener('click', eliminarArticulo);

                celdaAcciones.classList.add('col-3', 'py-2', 'justify-content-around')
                celdaAcciones.appendChild(btnConsultar);
                celdaAcciones.appendChild(btnEditar);
                celdaAcciones.appendChild(btnEliminar);
                fila.appendChild( celdaAcciones );

                break;
            }

            // Agrego cada celda en la fila
            fila.appendChild( celda );
        }

        // Agrego la fila (registro de articulo) a la tabla
        tablaArticulos.querySelector('tbody').appendChild(fila);
    }
}


async function verArticulo(e){
    const idArticulo = e.target.getAttribute('data-articulo')
    // const articulo = await traerDatosPorIdAPI();

    const paramsModalConsultarArticulo = {
        "idModal": 'consultarArticulo',
        "accion": `consultar`,
        "coleccion": 'Articulo',
        "size": 'modal-lg',
    }
    const modalConsultarArticulo = crearModal(paramsModalConsultarArticulo);

    const bodyModal = modalConsultarArticulo.querySelector('.modal-body')
    bodyModal.appendChild( crearBtnsAccionesArticulo(idArticulo) );
    bodyModal.appendChild( crearFormArticulo() );
    modalConsultarArticulo.querySelector('#btnGuardarArticulo').remove();

    const btnAcciones = bodyModal.querySelector('#acciones');

    const btnEditarArticulo = btnAcciones.querySelector('#btnEditarArticulo');
    btnEditarArticulo.addEventListener('click', (e) => {
        cerrarModal( modalConsultarArticulo.id );
        editarArticulo(e);
    });

    const btnEliminarArticulo = btnAcciones.querySelector('#btnEliminarArticulo');
    btnEliminarArticulo.addEventListener('click', (e) => {
        cerrarModal( modalConsultarArticulo.id );
        eliminarArticulo(e);
    });

    const btnFaltaStock = btnAcciones.querySelector('#btnFaltaStock');
    btnFaltaStock.addEventListener('click', (e) => {
        cambiarStock(e);
    });


    const { resp, data : { articulo: { nombre, precio, descripcion} } } = await traerDatosPorIdAPI('articulos', idArticulo);

    const formArticulo = bodyModal.querySelector('form');
    const nombreArticuloInput = formArticulo.querySelector('#nombreArticulo');
    const precioArticuloInput = formArticulo.querySelector('#precioArticulo');
    const descripcionArticuloInput = formArticulo.querySelector('#descripcionArticulo');

    nombreArticuloInput.value = nombre;
    precioArticuloInput.value = precio;
    descripcionArticuloInput.value = descripcion;

    const arrInputsDeshabilitados = [
        { selector : nombreArticuloInput, bool: true },
        { selector : precioArticuloInput, bool: true },
        { selector : descripcionArticuloInput, bool: true }
    ]

    deshabilitarInputs(arrInputsDeshabilitados);
}

async function cambiarStock(e){
    const idArticulo = e.target.getAttribute('data-articulo');
    
    const { data: {articulo : articuloCambiado} } = await traerDatosPorIdAPI('articulos', idArticulo);
    delete articuloCambiado.estado;
    articuloCambiado.hayStock = false;

    const {resp, data: {msg} } = await actualizarDatosAPI('articulos', idArticulo, articuloCambiado);
    
    // muestro mensaje de exito o de fallo de la accion editar..
    const modalActual = document.querySelector('.modal.fade.show');
    const formArticulo = modalActual.querySelector('form')
    if( resp.status === 200 ){
        mostrarMsj('success', msg, formArticulo);
    } else {
        mostrarMsj('success', `No se pudo realizar la accion, debido al error: ${msg}`, formArticulo);
    }

    // cierro modal y sombra
    setTimeout( async() => {
        cerrarModal( modalActual.id );
        cargarTabla( await traerArticulos() );
    }, 1200);
}



function deshabilitarInputs(arrInputs) {
    for (let i = 0; i < arrInputs.length; i++) {
        const { selector, bool } = arrInputs[i];
        selector.disabled = bool;
    }
}

async function editarArticulo(e) {
    const idArticulo = e.target.getAttribute('data-articulo');

    const paramsModalEditarArticulo = {
        "idModal": 'editarArticulo',
        "accion": `Editar`,
        "coleccion": 'Articulo',
        "size": 'modal-lg',
    }
    const modalEditarArticulo = crearModal(paramsModalEditarArticulo);
    const { resp, data : { articulo: { nombre, precio, descripcion} } } = await traerDatosPorIdAPI('articulos', idArticulo);

    const bodyModal = modalEditarArticulo.querySelector('.modal-body')
    bodyModal.appendChild( crearFormArticulo() );

    const formArticulo = bodyModal.querySelector('form');
    const nombreArticuloInput = formArticulo.querySelector('#nombreArticulo');
    const precioArticuloInput = formArticulo.querySelector('#precioArticulo');
    const descripcionArticuloInput = formArticulo.querySelector('#descripcionArticulo');

    nombreArticuloInput.value = nombre;
    precioArticuloInput.value = precio;
    descripcionArticuloInput.value = descripcion;


    formArticulo.addEventListener('submit', (e) => {
        e.preventDefault();

        validarForm( formArticulo, async () => {
            const cambios = {
                "nombre" : nombreArticuloInput.value,
                "precio" : precioArticuloInput.value,
                "descripcion" : descripcionArticuloInput.value,
                "hayStock": true
            }
    
            // Envio los cambios
            const { resp, data : { articuloActualizado, msg } } = await actualizarDatosAPI('articulos', idArticulo, cambios);
            
            // muestro mensaje de exito o de fallo de la accion editar..
            if( resp.status === 200 ){
                mostrarMsj('success', msg, formArticulo);
            } else {
                mostrarMsj('success', `No se pudo realizar la accion, debido al error: ${msg}`, formArticulo);
            }
    
            // cierro modal y sombra
            setTimeout( async() => {
                cerrarModal( modalEditarArticulo.id );
                cargarTabla( await traerArticulos() );
            }, 1200);
        } );
    });
}

async function eliminarArticulo(e) {
    const idArticulo = e.target.getAttribute('data-articulo');
    
    const confirmEliminarArticulo = confirm('¿Esta seguro de eliminar este articulo?');
    if( confirmEliminarArticulo ){
        const { resp, data : { msg } } = await eliminarDatosAPI('articulos', idArticulo);
        const blockAlerta = document.querySelector('#alerta');
        if( resp.status === 200 ){
            mostrarMsj( 'success', msg, blockAlerta );

            setTimeout( async() => {
                cargarTabla( await traerArticulos() );
            }, 1200);
        } else {
            mostrarMsj( 'danger', 'No se pudo borrar el articulo, intente de nuevo', blockAlerta );
        }
    }
}

async function validarForm( form, callback ) {

    const nombre = form.querySelector('input#nombreArticulo').value;
    const descripcion  = form.querySelector('textarea#descripcionArticulo').value;
    
    // valido campos 
    if( !validarInputString(nombre) || !validarInputString(descripcion) ){
        mostrarMsj('danger', 'El campo nombre y descripcion son obligatorios.', form);
        return;
    } else {
        callback();
        return;
    }
}
