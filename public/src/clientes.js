import { validarInputString } from './funciones.js';
import { traerDatosAPI, traerDatosPorIdAPI, actualizarDatosAPI } from './funciones-API.js';

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
        // fila.dataset.cliente = clientes[i]._id;
        

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
                btnEliminar.dataset.cliente = clientes[i]._id

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
    const modalEditar = crearModal('Editar', 'clientes'); 
    const formEditar  = crearFormClientes();

    // campos a llenar con los datos de un cliente a modificar
    const campos = ['nombre', 'apellido', 'telefono', 'direccion'];
    
    const { resp, data : { cliente } } = await traerDatosPorIdAPI('clientes', idCliente);

    llenarForm( formEditar, campos, cliente );

    // Inserto el formulario en el modal
    modalEditar.querySelector('.modal-body').appendChild( formEditar );
    

    // Inserto el modal antes de la etiqueta <script>
    const body = document.querySelector('body');
    body.insertBefore( modalEditar, document.querySelector('script') );

    body.classList.add('modal-open');
    body.style.overflow = 'hidden'; 
    body.style.paddingRight = '17px'; 

    // Creo la sombra o fondo negro detas del modal
    const sombraModal = crearSombraModal();
    body.appendChild( sombraModal );

    // Cierro el modal si aprieta el btn cerrar o la sombraModal
    document.querySelector('#btnCerrarModal').addEventListener('click', (e) => {
        cerrarModal(modalEditar.id);
    });

    modalEditar.addEventListener('click', (e) => {
        if( e.target === modalEditar ){
            cerrarModal(e.target.id);
        }
    });

    modalEditar.querySelector('#btnCancelar').addEventListener('click', (e) => {
        cerrarModal(modalEditar.id);
    });

    formEditar.addEventListener('submit', (e) => {
        e.preventDefault();

        validarForm( formEditar, idCliente );
    });
}


async function validarForm( form, idCliente ) {
    
    const nombre = form.querySelector('input#nombre').value;
    const apellido  = form.querySelector('input#apellido').value;
    const telefono  = form.querySelector('input#telefono').value  || '--';
    const direccion = form.querySelector('input#direccion').value || '--';
    
    // valido campos 
    if( !validarInputString(nombre) || !validarInputString(apellido) ){
        mostrarMsj('danger', 'El campo nombre y apellido son obligatorios.', form);
        return;
    } else {
        const cambios = {
            nombre,
            apellido,
            telefono,
            direccion
        }

        // Envio los cambios
        const { resp, data : { clienteActualizado, msg } } = await actualizarDatosAPI('clientes', idCliente, cambios);
        console.log(clienteActualizado);
        
        // muestro mensaje 
        const modalActual = document.querySelector('div[id^="modal"]').id;
        if( resp.status === 200 ){
            mostrarMsj('success', msg, form);
        } else {
            mostrarMsj('success', `No se pudo realizar la accion, debido al error: ${msg}`, form);
        }

        // cierro modal y sombra
        setTimeout( async() => {
            cerrarModal(modalActual);
            
            limpiarContenidoTabla();
            cargarTabla( await traerClientes() );
        }, 1500);
    }
}


function limpiarContenidoTabla() {
    const tabla = document.querySelector('tbody');

    while( tabla.firstChild ){
        tabla.removeChild( tabla.firstChild );
    }
}

async function traerClientes(){
    const { resp, data: { clientes, totalClientes } } = await traerDatosAPI('clientes');

    const clientesLimpios = clientes.map( cliente => {
        const { estado, ...resto } = cliente;
        return { ...resto };
    })

    return clientesLimpios;
}



// function abrirModalCrear(){}

