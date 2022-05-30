import { validarInputString } from './funciones.js';

import { 
    traerDatosAPI,
    traerDatosPorIdAPI,
    actualizarDatosAPI,
    enviarDatosAPI,
    eliminarDatosAPI
} from './funciones-API.js';

import { 
    crearModal, 
    crearSombraModal,
    crearFormClientes, 
    cerrarModal,
    mostrarMsj,
    llenarForm
} from './funciones-UI.js';


document.addEventListener('DOMContentLoaded', async() => {
    cargarTabla( await traerClientes() );

    const btnCrearCliente = document.querySelector('#btnCrearCliente');
    btnCrearCliente.addEventListener('click', crearCliente);
});


function cargarTabla( clientes ){
    const tablaClientes = document.querySelector('table#clientes');

    if( clientes.length === 0 ){
        const filaVacia = document.createElement('tr');
        filaVacia.classList.add('text-center');

        const celdaVacia = document.createElement('td');
        celdaVacia.colSpan = '10';
        celdaVacia.classList.add('fw-bold', 'py-4', 'fs-3');
        celdaVacia.textContent = 'No hay clientes, crea algunos con el boton azul de arriba'

        filaVacia.appendChild(celdaVacia);

        tablaClientes.appendChild(filaVacia);
        return;
    }

    // Por cada cliente...
    for (let i = 0; i < clientes.length; i++) {
        
        // Creo una fila en la tabla
        const fila = document.createElement('tr');
        fila.classList.add('text-center');
        
        // Creo las celdas de cada value de cada cliente
        for (let j = 0; j <= Object.values(clientes[i]).length; j++) {

            const celda = document.createElement('td');
            celda.textContent = Object.values(clientes[i])[j];  
            celda.id = Object.keys(clientes[i])[j];
            if( celda.id === '_id' ) {
                celda.textContent = i+1;
            }

            // Si llego al final, creo los botones Editar y Eliminar (ACCIONES)
            if( Object.values(clientes[i]).length === j ){
                const celdaAcciones = document.createElement('td');

                const btnEditar = document.createElement('button');
                btnEditar.classList.add('btn', 'btn-sm', 'btn-warning');
                btnEditar.textContent = 'Editar';
                btnEditar.addEventListener('click', editarCliente);
                btnEditar.dataset.cliente = clientes[i]._id

                const btnEliminar = document.createElement('button');
                btnEliminar.classList.add('btn', 'btn-sm', 'btn-danger');
                btnEliminar.textContent = 'Eliminar';
                btnEliminar.addEventListener('click', eliminarCliente);
                btnEliminar.dataset.cliente = clientes[i]._id

                celdaAcciones.classList.add('col-2', 'py-2', 'justify-content-around')
                celdaAcciones.appendChild(btnEditar);
                celdaAcciones.appendChild(btnEliminar);
                fila.appendChild( celdaAcciones );

                break;
            }

            // Agrego cada celda en la fila
            fila.appendChild( celda );
        }

        // Agrego la fila (registro de cliente) a la tabla
        tablaClientes.querySelector('tbody').appendChild(fila);
    }
}



function editarCliente(e) {
    const idCliente = e.target.getAttribute('data-cliente');
    
    abrirModalEditar(idCliente);
}


async function abrirModalEditar( idCliente ){
    // Creo modal Editar
    const paramsModalEditarCliente = {
        "idModal": 'editarCliente',
        "accion": `Editar`,
        "coleccion": 'Cliente',
        "size": 'modal-lg',
    }
    const modalEditar = crearModal(paramsModalEditarCliente); 
    const formEditar  = crearFormClientes();

    // campos a llenar con los datos de un cliente a modificar
    const campos = ['nombre', 'apellido', 'telefono', 'direccion'];
    
    const { resp, data : { cliente } } = await traerDatosPorIdAPI('clientes', idCliente);

    llenarForm( formEditar, campos, cliente );

    // Inserto el formulario en el modal
    modalEditar.querySelector('.modal-body').appendChild( formEditar );

    modalEditar.querySelector('#btnCancelar').addEventListener('click', (e) => {
        cerrarModal(modalEditar.id);
    });

    formEditar.addEventListener('submit', (e) => {
        e.preventDefault();

        validarForm( formEditar, async () => {
            const cambios = {
                "nombre" : formEditar.querySelector('input#nombre').value,
                "apellido" : formEditar.querySelector('input#apellido').value,
                "telefono" : formEditar.querySelector('input#telefono').value  || '--',
                "direccion" : formEditar.querySelector('input#direccion').value || '--'
            }
    
            // Envio los cambios
            const { resp, data : { clienteActualizado, msg } } = await actualizarDatosAPI('clientes', idCliente, cambios);
            console.log(clienteActualizado);
            
            // muestro mensaje de exito o de fallo de la accion editar..
            if( resp.status === 200 ){
                mostrarMsj('success', msg, formEditar);
            } else {
                mostrarMsj('success', `No se pudo realizar la accion, debido al error: ${msg}`, formEditar);
            }
    
            // cierro modal y sombra
            setTimeout( async() => {
                cerrarModal( modalEditar.id );
                
                limpiarContenidoTabla();
                cargarTabla( await traerClientes() );
            }, 1500);
        } );
    });
}


async function validarForm( form, callback ) {

    const nombre = form.querySelector('input#nombre').value;
    const apellido  = form.querySelector('input#apellido').value;
    const telefono  = form.querySelector('input#telefono').value  || '--';
    const direccion = form.querySelector('input#direccion').value || '--';
    
    // valido campos 
    if( !validarInputString(nombre) || !validarInputString(apellido) ){
        mostrarMsj('danger', 'El campo nombre y apellido son obligatorios.', form);
        return;
    } else {
        callback();
        return;
    }
}


function limpiarContenidoTabla() {
    const tabla = document.querySelector('tbody');

    while( tabla.firstChild ){
        tabla.removeChild( tabla.firstChild );
    }
}

async function traerClientes(){
    const { resp, data: { clientes, total } } = await traerDatosAPI('clientes');

    const clientesLimpios = clientes.map( cliente => {
        const { estado, ...resto } = cliente;
        return { ...resto };
    })

    return clientesLimpios;
}



function crearCliente(){
    // Creo modal Editar
    const paramsModalCrearCliente = {
        "idModal": 'crearCliente',
        "accion": `Crear`,
        "coleccion": 'Cliente',
        "size": 'modal-lg',
    }
    const modalCrear = crearModal(paramsModalCrearCliente); 
    const formCrear  = crearFormClientes();

    // Inserto el formulario en el modal
    modalCrear.querySelector('.modal-body').appendChild( formCrear );
    

    modalCrear.querySelector('#btnCancelar').addEventListener('click', (e) => {
        cerrarModal( modalCrear.id );
    });

    formCrear.addEventListener('submit', (e) => {
        e.preventDefault();

        validarForm( formCrear, async() => {
            const nuevoCliente = {
                "nombre" : formCrear.querySelector('input#nombre').value,
                "apellido" : formCrear.querySelector('input#apellido').value,
                "telefono" : formCrear.querySelector('input#telefono').value  || '--',
                "direccion" : formCrear.querySelector('input#direccion').value || '--'
            }
    
            // Envio los cambios
            const { resp, data : { msg } } = await enviarDatosAPI('clientes', nuevoCliente);
            
            // muestro mensaje de exito o de fallo de la accion editar..
            if( resp.status === 200 ){
                mostrarMsj('success', msg, formCrear);
            } else {
                mostrarMsj('success', `No se pudo realizar la accion, debido al error: ${msg}`, formCrear);
            }
    
            // cierro modal y sombra
            setTimeout( async() => {
                cerrarModal( modalCrear.id );

                limpiarContenidoTabla();
                cargarTabla( await traerClientes() );
            }, 1500);
        });
    });
}

async function eliminarCliente(e) {
    const idCliente = e.target.getAttribute('data-cliente');
    
    const confirmEliminarCliente = confirm('¿Esta seguro de eliminar este cliente?');
    if( confirmEliminarCliente ){
        const { resp, data : { msg } } = await eliminarDatosAPI('clientes', idCliente);
        const blockAlerta = document.querySelector('#alerta');
        if( resp.status === 200 ){
            mostrarMsj( 'success', msg, blockAlerta );

            setTimeout( async() => {
                limpiarContenidoTabla();
                cargarTabla( await traerClientes() );
            }, 1200);
        } else {
            mostrarMsj( 'danger', 'No se pudo borrar el cliente, intente de nuevo', blockAlerta );
        }
    }
}

