
import { actualizarDatosAPI, eliminarDatosAPI, enviarDatosAPI, traerDatosAPI, traerDatosPorIdAPI } from '../src/funciones-API.js';
import { crearModal, cerrarModal, crearFormArticulo, mostrarMsj, crearBtnsAccionesTabla, crearBtnsAccionesArticulo } from '../src/funciones-UI.js';
import { validarInputString } from './funciones.js';

// vars
const tablaArticulos = document.querySelector('table#articulos')
const tablaArticulosSinStock = document.querySelector('table#sinStock');


// Cuando se cargue el HTML...
document.addEventListener('DOMContentLoaded', async() => {
    registrarEventListeners();

    setearTabla( tablaArticulos, await traerArticulos() );
});


// fn que quita la tabla actual en pantalla y muestra una tabla indicada. 
function switchTabla(tabla) {
    if( tabla.parentElement.classList.contains('displayOff') ){
        displayTabla(tabla.id);
    } 
    return;
}


function setearTabla( tabla, articulos ){    
    cargarTabla( tabla, articulos );

    const btnsAcciones = [
        { idBtn: 'btnConsultarArticulo', texto: 'Consultar', eventListeners: verArticulo, clasesCSS: 'btn btn-sm btn-success'},
        { idBtn: 'btnEditarArticulo', texto: 'Editar', eventListeners: editarArticulo, clasesCSS: 'btn btn-sm btn-info'},
        { idBtn: 'btnEliminarArticulo', texto: 'Eliminar', eventListeners: eliminarArticulo, clasesCSS: 'btn btn-sm btn-danger'},
    ];

    agregarBtnsAccionesTabla( tabla, articulos, btnsAcciones );
}


function registrarEventListeners() {
    const btnCrearArticulo = document.querySelector('#btnCrearArticulo');
    btnCrearArticulo.addEventListener('click', crearArticulo);

    const btnVerArticuloSinStock = document.querySelector('#btnVerArticulosSinStock');
    btnVerArticuloSinStock.addEventListener('click', async(e) => {
        verTabla( e, await traerArticulos('sinStock') );
    });

    const btnVerArticulos = document.querySelector('#btnVerArticulos');
    btnVerArticulos.addEventListener('click', async(e) => {
        verTabla( e, await traerArticulos() );
    });
}


// fn para los BTNS 'ver tabla ...'
function verTabla(e, articulos){
    const idTabla = e.target.getAttribute('data-table');

    displayTabla(idTabla);

    const tabla = document.querySelector(`table#${idTabla}`);
    setearTabla( tabla, articulos );
}


function displayTabla(idTabla) {
    const tablaAremover = document.querySelector('.table-responsive:not(.displayOff)');
    tablaAremover.classList.add('displayOff');

    const tablaAmostrar = document.querySelector(`.table-responsive > table#${idTabla}`).parentElement;
    tablaAmostrar.classList.remove('displayOff');
}


function crearArticulo(e){
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

                switchTabla(tablaArticulos);
                setearTabla( tablaArticulos, await traerArticulos() );
            }, 1200);
        } );
    });
}


async function traerArticulos(filtro = ''){
    const paramsRequestArticulos = {
        controller: 'articulos',
        limite: null,
        desde: null,
        filtro
    }

    const { resp, data: { articulos } } = await traerDatosAPI(paramsRequestArticulos);

    const articulosLimpios = articulos.map( articulo => {
        const { estado, descripcion, ...resto } = articulo;
        return { ...resto };
    });

    return articulosLimpios;
}


function limpiarContenidoTabla(tabla) {
    const contenidoTabla = tabla.querySelector('table tbody');

    while( contenidoTabla.firstChild ){
        contenidoTabla.removeChild( contenidoTabla.firstChild );
    }
}


// carga una tabla con articulos y una celda de Acciones
function cargarTabla( tabla, articulos ){
    limpiarContenidoTabla(tabla);

    if( articulos.length === 0 ){
        const filaVacia = document.createElement('tr');
        filaVacia.classList.add('text-center');

        const celdaVacia = document.createElement('td');
        celdaVacia.colSpan = '10';
        celdaVacia.classList.add('fw-bold', 'py-4', 'fs-3');
        celdaVacia.textContent = 'No hay articulos, crea algunos con el boton azul de arriba'

        filaVacia.appendChild(celdaVacia);

        tabla.appendChild(filaVacia);
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
        for (let j = 0; j < valuesArticulo.length; j++) {
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

            // Agrego cada celda en la fila
            fila.appendChild( celda );
        }

        // Agrego la fila (registro de articulo) a la tabla
        tabla.querySelector('tbody').appendChild(fila);
    }
}


// Por cada articulo de la tabla HTML, agrego una celda de Acciones con los 'btns' especificados
function agregarBtnsAccionesTabla( idTabla, articulos, btns ) {
    const filasTablas = Array.from( idTabla.querySelectorAll('tbody > tr') );

    // Por cada articulo.. 
    for (let i = 0; i < articulos.length; i++) {
        const { _id } = articulos[i];
        const filaActual = filasTablas[i];

        // A cada boton le asigno un 'dataSet', con el id del articulo correspondiente
        const btnsMapeados = btns.map( btn => {
            const btnNuevo = { ...btn, dataSet: _id };
            return btnNuevo;
        });
        
        // Agrego la celda que es creada por la fn 'crearBtnsAccionesTabla'
        filaActual.appendChild( crearBtnsAccionesTabla(btnsMapeados) );
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
                "descripcion" : descripcionArticuloInput.value
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

                const tablaActual = document.querySelector('.table-responsive:not(.displayOff)');
                const filtroArticulos = tablaActual.querySelector('table').getAttribute('data-articulos');
                setearTabla( tablaActual, await traerArticulos(filtroArticulos) );
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

                const tablaActual = document.querySelector('.table-responsive:not(.displayOff)');
                const filtroArticulos = tablaActual.querySelector('table').getAttribute('data-articulos');

                setearTabla( tablaActual, await traerArticulos(filtroArticulos) );
            }, 1200);
        } else {
            mostrarMsj( 'danger', 'No se pudo borrar el articulo, intente de nuevo', blockAlerta );
        }
    }
}


async function verArticulo(e){
    const idArticulo = e.target.getAttribute('data-articulo');

    const paramsModalConsultarArticulo = {
        "idModal": 'consultarArticulo',
        "accion": `consultar`,
        "coleccion": 'Articulo',
        "size": 'modal-lg',
    }
    const modalConsultarArticulo = crearModal(paramsModalConsultarArticulo);

    const bodyModal = modalConsultarArticulo.querySelector('.modal-body');
    const tablaActual = document.querySelector('.table-responsive:not(.displayOff)');
    const idTablaActual = tablaActual.querySelector('table').id;

    let articulosPostAccion;
    // traigo los articulos correspondientes segun la tablaActual
    async function setArticulosPostAccion(){
        switch (idTablaActual) {
            case 'articulos':
                articulosPostAccion = await traerArticulos();
                break;
            case 'sinStock':
                articulosPostAccion = await traerArticulos('sinStock');
                break;
        }
        return articulosPostAccion;
    }

    const cerrarModalYEditar = (e) => {
        cerrarModal( modalConsultarArticulo.id );
        editarArticulo(e);
    }

    const cerrarModalYEliminar = (e) => {
        cerrarModal( modalConsultarArticulo.id );
        eliminarArticulo(e);
    };

    const marcarStockCompleto = async(e) => {
        await cambiarStock(e, true);
        setearTabla( tablaActual, await setArticulosPostAccion() );
    };

    const marcarStockIncompleto = async(e) => {
        await cambiarStock(e, false);
        setearTabla( tablaActual, await setArticulosPostAccion() );
    };

    bodyModal.appendChild( crearFormArticulo() );
    modalConsultarArticulo.querySelector('#btnGuardarArticulo').remove();


    const { resp, data : { articulo: { nombre, precio, descripcion, hayStock } } } = await traerDatosPorIdAPI('articulos', idArticulo);

    // Si el articulo tiene stock, muestro el boton 'Falta Stock', de lo contrario, 'Stock Completo'
    const btnMarcarStock = (hayStock) 
                                ? { idBtn: 'btnFaltaStock', texto: 'Falta stock', eventListeners: marcarStockIncompleto, clasesCSS: 'col-3 btn btn-warning fw-bold border border-dark border-1 rounded p-2 fs-4'} 
                                : { idBtn: 'btnStockCompleto', texto: 'Stock completo', eventListeners: marcarStockCompleto, clasesCSS: 'col-3 btn btn-success fw-bold border border-dark border-1 rounded p-2 fs-4'} ;
    
    const btnsAcciones = [
        btnMarcarStock,
        { idBtn: 'btnEditarArticulo', texto: 'Editar', eventListeners: cerrarModalYEditar, clasesCSS: 'col-3 btn btn-info fw-bold border border-dark border-1 rounded p-2 fs-4'},
        { idBtn: 'btnEliminarArticulo', texto: 'Eliminar', eventListeners: cerrarModalYEliminar, clasesCSS: 'col-3 btn btn-danger fw-bold border border-dark border-1 rounded p-2 fs-4'},
    ];


    const formArticulo = bodyModal.querySelector('form');
    
    bodyModal.insertBefore( crearBtnsAccionesArticulo(idArticulo, btnsAcciones), formArticulo);
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


async function cambiarStock(e, bool){
    const idArticulo = e.target.getAttribute('data-articulo');

    const { data: {articulo : articuloCambiado} } = await traerDatosPorIdAPI('articulos', idArticulo);
    delete articuloCambiado.estado;
    articuloCambiado.hayStock = bool;

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
    }, 1200);
}


function deshabilitarInputs(arrInputs) {
    for (let i = 0; i < arrInputs.length; i++) {
        const { selector, bool } = arrInputs[i];
        selector.disabled = bool;
    }
}

// fn que valida los campos 'nombre' y 'descripcion' de un form
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
