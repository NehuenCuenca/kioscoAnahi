import { traerFecha } from '../src/funciones.js'
import { cerrarSesion } from './funciones-API.js';

export function crearModal( paramsModal ){
    const { 
        idModal = '',
        accion = '', 
        coleccion = '',
        size = 'modal-xl'
    } = paramsModal;

    const modal = document.createElement('div');
    modal.id = idModal;
    modal.classList.add('modal', 'fade', 'show');
    modal.style.display = 'block';
    modal.role = 'dialog';

    modal.innerHTML += `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header justify-content-center text-capitalize">
                    <h5 class="modal-title" id="modal${accion}">${accion} ${coleccion}</h5>
                </div>

                <div class="modal-body row justify-content-center px-4"></div>

                <div class="modal-footer align-items-center justify-content-center">
                    <button type="button" id="btnCerrarModal" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    modal.querySelector('.modal-dialog').classList.add(size);

    const body = document.querySelector('body');
    body.insertBefore( modal, document.querySelector('script') );
    
    body.classList.add('modal-open');
    body.style.overflow = 'hidden'; 
    body.style.paddingRight = '17px'; 

    const sombraModal = crearSombraModal();
    body.appendChild( sombraModal );
    
    // Cierro el modal si aprieta el btn cerrar o la sombraModal
    modal.querySelector('#btnCerrarModal').addEventListener('click', (e) => {
        cerrarModal(modal.id);
    })

    modal.addEventListener('click', (e) => {
        if( e.target === modal ){
            cerrarModal(e.target.id);
        }
    });

    return modal;
}


export function crearSombraModal() {
    const modalShadow = document.createElement('div');
    modalShadow.id = 'modalShadow';
    modalShadow.classList.add('modal-backdrop', 'fade', 'show');

    return modalShadow;
}


export function cerrarModal(idModal) {
    // Si ya se cerro el modal, retorno..
    if( !document.querySelector(`#${idModal}`) ){return};

    // Remuevo el modal y sombra
    document.querySelector(`#${idModal}`).remove(); 
    document.querySelector(`#modalShadow`).remove(); 
}


export function crearFormClientes(){
    const form = document.createElement('form');

    form.innerHTML += `
        <div class="row justify-content-md-around my-3">
            <div class="col-md-4 mb-3">
                <label for="nombre" class="form-label fw-bold">Nombre</label>
                <input type="text" class="form-control" id="nombre" placeholder="Nombre del cliente">
            </div>
            <div class="col-md-4 mb-3">
                <label for="apellido" class="form-label fw-bold">Apellido</label>
                <input type="text" class="form-control" id="apellido" placeholder="Apellido del cliente">
            </div>
        </div>
        <div class="row justify-content-md-around my-3">
            <div class="col-md-4 mb-3">
                <label for="telefono" class="form-label fw-bold">Telefono</label>
                <input type="text" class="form-control" id="telefono" placeholder="Telefono o celular">
            </div>
            <div class="col-md-4 mb-3">
                <label for="direccion" class="form-label fw-bold">Direccion</label>
                <input type="text" class="form-control" id="direccion" placeholder="Direccion o domicilio">
            </div>
        </div>
        
        <div class="row justify-content-center">
            <div class="row col-4 justify-content-between">
                <button id="btnGuardar" type="submit "class="btn btn-success col-5"> Guardar </button>
                <button id="btnCancelar" class="btn btn-danger col-5"> Cancelar </button>
            </div>
        </div>
    `;

    return form;
}


export function mostrarMsj( clase, msj, elemPadre ) {
    // verifico si ya existe la alerta (asi no se repite...)
    const existeAlerta = document.querySelector('.alert');
    if( existeAlerta ){
        return;
    } 

    const bloqueMsj = document.createElement('div');
    bloqueMsj.classList.add('alert', `alert-${clase}`);
    bloqueMsj.textContent = msj;

    elemPadre.appendChild( bloqueMsj );

    setTimeout(() => {
        bloqueMsj.remove();
    }, 2000);
}

export function llenarForm( form, camposAllenar = [], valores ){

    if( camposAllenar.length === 0 ){
        return console.error('Debes especificar un array de campos a llenar');
    }

    const camposTotales = Array.from( form.querySelectorAll('input') );

    const camposFinal = camposTotales.map( (campo,i) => {
        if( camposAllenar.includes(campo.id) ){
            return campo;
        }
    }).filter( campo => campo !== undefined);

    camposFinal.forEach( campo => {
        campo.value = valores[campo.id];
    })
}


export function crearFormVerHistorial( historial ) {
    const formVerHistorial = document.createElement('form');
    formVerHistorial.classList.add('row', 'my-3', 'justify-content-around', 'p-2', 'col-12', 'text-center', 'justify-content-center', 'border', 'border-secondary', 'p-2', 'text-white');
    formVerHistorial.id = 'blockCrearDeuda';

    formVerHistorial.innerHTML = `
        <div id="blockCliente" class="row col-4 my-3 justify-content-center">
            <select id="listaClientes" class="row form-select form-select-lg">
                <option value="" selected>Seleccione un cliente</option>
            </select>
            <input type="text" id="inputCliente" class="row form-control" placeholder="Si no existe en la lista, crea uno nuevo aca..">
        </div>

        <div id="btnGuardarDeuda" class="row col-4 my-3 justify-content-center">
            <button class="btn btn-success">Guardar</button>
        </div>
    `;

    for (let i = 0; i < historial.length; i++) {
        const deudaActual = historial[i];
        const { fecha } = deudaActual;

        const bloqueDeudaActual = document.createElement('div');
        bloqueDeudaActual.classList.add('mb-5');
        bloqueDeudaActual.id = `deudaNro${i}`;
        bloqueDeudaActual.innerHTML = `
            <div class="row col-12 justify-content-center">
                <h1 class="text-dark" id="fechaDeuda">${fecha}</h1>
            </div>

            <div class="row col-12 justify-content-around">
                <div class="col-5 bg-danger mh-auto border border-2 border-dark rounded p-3" id="blockEnContra">
                    EN CONTRA
                    <div class="row col py-3 justify-content-center">
                        <button id="btnSumarArticuloEnContra${i}" class="btn btn-primary col-6"> Sumar articulo </button>
                        <div id="contenidoColumna" class="row col-12 justify-content-center p-2"></div>
                    </div>
                </div>
                <div class="col-5 bg-success mh-auto border border-2 border-dark rounded p-3" id="blockAFavor">
                    A FAVOR
                    <div class="row col py-3 my-1 justify-content-center">
                        <button id="btnSumarArticuloAFavor${i}" class="btn btn-primary col-6"> Sumar articulo </button>
                        <div id="contenidoColumna" class="col-12 justify-content-center p-2"></div>
                    </div>
                </div>
            </div>
        `;

        formVerHistorial.appendChild(bloqueDeudaActual)
    }

    return formVerHistorial;
}


export function crearFormHistorialNuevo() {
    const formHistorialNuevo = document.createElement('form');
    formHistorialNuevo.classList.add('row', 'my-3', 'justify-content-around', 'p-2', 'col-12', 'text-center', 'justify-content-center', 'border', 'border-secondary', 'p-2', 'text-white');
    formHistorialNuevo.id = 'blockCrearDeuda';

    formHistorialNuevo.innerHTML = `
        <div id="blockCliente" class="row col-4 my-3 justify-content-center">
            <select id="listaClientes" class="row form-select form-select-lg">
                <option value="" selected>Seleccione un cliente</option>
            </select>
            <input type="text" id="inputCliente" class="row form-control" placeholder="Si no existe en la lista, crea uno nuevo aca..">
        </div>

        <div class="row col-12 justify-content-center">
            <h1 class="text-dark" id="fechaDeuda">${traerFecha()}</h1>
        </div>

        <div class="row col-12 justify-content-around" id="deudaNro0">
            <div class="col-5 bg-danger mh-auto border border-2 border-dark rounded p-3" id="blockEnContra">
                EN CONTRA
                <div class="row col py-3 justify-content-center">
                    <button id="btnSumarArticuloEnContra0" class="btn btn-primary col-6"> Sumar articulo </button>
                    <div id="contenidoColumna" class="row col-12 justify-content-center p-2"></div>
                </div>
            </div>
            <div class="col-5 bg-success mh-auto border border-2 border-dark rounded p-3" id="blockAFavor">
                A FAVOR
                <div class="row col py-3 my-1 justify-content-center">
                    <button id="btnSumarArticuloAFavor0" class="btn btn-primary col-6"> Sumar articulo </button>
                    <div id="contenidoColumna" class="col-12 justify-content-center p-2"></div>
                </div>
            </div>
        </div>


        <div id="btnGuardarDeuda" class="row col-4 my-3 justify-content-center">
            <button class="btn btn-success">Guardar</button>
        </div>
    `;

    // console.log(blockCrearDeuda)
    return formHistorialNuevo;
}


export function sumarArticuloDeuda( contenidocolumna ) {
    const blockNuevoArticuloDeuda = document.createElement('div');
    blockNuevoArticuloDeuda.classList.add('row', 'my-3', 'justify-content-around', 'p-2');

    const nroArticuloDeuda = Array.from( contenidocolumna.querySelectorAll('div[id^="blockArticuloDeuda"]') ).length;
    blockNuevoArticuloDeuda.id = `blockArticuloDeuda${nroArticuloDeuda}`;

    blockNuevoArticuloDeuda.innerHTML += `
        <div class="row col-6 justify-content-center">
            <select id="listaArticulo" class="row col-12 form-select form-select-sm">
                <option value="">Seleccione un articulo</option>
            </select>
            <input type="text" id="articuloDeuda" class="row col-12 form-control form-control-sm" placeholder="Si no existe en la lista, crea uno nuevo aca..">
        </div>

        <div class="col-4 d-flex align-items-center justify-content-center">
            <input type="number" placeholder="Precio" id="precioArticulo" class="col-12 form-control form-control-md" min="0">
        </div>

        <div class="col-1 d-flex align-items-center justify-content-center">
            <button id="btnBorrarArticulo" class="btn btn-dark col"> X </button>
        </div>
    `;
    
    blockNuevoArticuloDeuda.querySelector('#btnBorrarArticulo').addEventListener('click', () => {
        blockNuevoArticuloDeuda.remove();
    })

    contenidocolumna.appendChild( blockNuevoArticuloDeuda );
}


// Por bloque de articulo  (requiere bucle), deshabilito los inputs y selects
export function habilitarBloqueArticulo(bloqueArticulo, bool){
    if(!bloqueArticulo){return}
    const selectNombreArticulo = bloqueArticulo.querySelector('select#listaArticulo');
    const inputNombreArticulo  = bloqueArticulo.querySelector('input#articuloDeuda');
    const inputPrecioArticulo  = bloqueArticulo.querySelector('input#precioArticulo');
    
    
    selectNombreArticulo.disabled = bool;
    inputNombreArticulo.disabled  = bool;
    inputPrecioArticulo.disabled  = bool;

    if( bool ){
        bloqueArticulo.querySelector('#btnBorrarArticulo').style.display = 'none';
    } else {
        bloqueArticulo.querySelector('#btnBorrarArticulo').style.display = '';
    }
}


export function cargarSelectClientes( select, clientes ){
    for (let i = 0; i < clientes.length; i++) {
        const { nombre, apellido, _id } = clientes[i];

        const option = document.createElement('option');
        option.textContent = `${nombre} ${apellido}`;
        option.value = _id;

        select.appendChild( option );
    }

    return;
}


export function cargarSelectConArticulos( select, articulos ){
    for (let i = 0; i < articulos.length; i++) {
        const { nombre, _id } = articulos[i];

        const option = document.createElement('option');
        option.textContent = `${nombre}`;
        option.value = _id;

        select.appendChild( option );
    }

    return;
}


export function crearBtnsAccionesDeuda(id = '') {
    const filaBtns = document.createElement('div'); 
    filaBtns.classList.add('row','col-8', 'justify-content-around');

    filaBtns.innerHTML += ` 
            <button id="btnEditarDeuda" data-deuda="${id}" class="col-3 btn btn-info fw-bold border border-dark border-1 rounded">Editar deuda</button>
            <button id="btnSaldarDeuda" data-deuda="${id}" class="col-3 btn btn-warning fw-bold border border-dark border-1 rounded">Saldar deuda</button>
    `;

    function deshabilitarBotones(e) {
        const totalBtns = Array.from( filaBtns.querySelectorAll('button') );

        const hayDeshabilitados = Boolean( Array.from(filaBtns.querySelectorAll('button:disabled')).length > 0 );
        if( hayDeshabilitados ){
            for (let i = 0; i < totalBtns.length; i++) {
                const btn = totalBtns[i];
                btn.disabled = false;
            }

            return;
        }

        for (let i = 0; i < totalBtns.length; i++) {
            const btn = totalBtns[i];
            if( btn.id !== e.target.id ){
                btn.disabled = true;
            } 
        }
    }

    const btnEditarDeuda= filaBtns.querySelector('#btnEditarDeuda');
    const btnSaldarDeuda= filaBtns.querySelector('#btnSaldarDeuda');

    btnEditarDeuda.addEventListener('click', deshabilitarBotones);
    btnSaldarDeuda.addEventListener('click', deshabilitarBotones);

    return filaBtns;
}


export function crearFormArticulo() {
    const form = document.createElement('form');

    form.classList.add('row', 'col-10', 'justify-content-center');

    form.innerHTML += `
        <div class="row col-10 justify-content-around">    
            <div class="row col-6 my-4">
                <label for="nombreArticulo" class="form-label">Nombre del articulo</label>
                <input type="text" class="form-control" id="nombreArticulo" placeholder="Ej: galletita, gaseosa, caramelos">
            </div>
            <div class="row col-6 my-4">
                <label for="precioArticulo" class="form-label">Precio del articulo</label>
                <input type="number" class="form-control" id="precioArticulo" >
            </div>
        </div>
        <div class="row col-8 my-4">
            <label for="descripcionArticulo" class="form-label">Descripcion</label>
            <textarea class="form-control" id="descripcionArticulo" rows="4" placeholder="Breve descripcion sobre el articulo/producto"></textarea>
        </div>
        <div id="btnGuardarArticulo" class="row col-8 my-3 justify-content-center">
            <button class="btn btn-success">Guardar</button>
        </div>
    `;

    return form;
}

export function crearBtnsAccionesArticulo(idArticulo = '', btns) {
    const filaBtns = document.createElement('div'); 
    filaBtns.classList.add('row','col-8', 'justify-content-around');
    filaBtns.id = "acciones";

    for (let i = 0; i < btns.length; i++) {
        const { idBtn, texto, eventListeners, clasesCSS } = btns[i];
        
        const nuevoBtn = document.createElement('button');
        nuevoBtn.id = idBtn;
        nuevoBtn.textContent = texto;
        nuevoBtn.dataset.articulo = idArticulo;
        nuevoBtn.addEventListener('click', eventListeners);
        nuevoBtn.className = clasesCSS;
        
        filaBtns.appendChild( nuevoBtn );
    }

    return filaBtns;
}


export function crearBtnsAccionesTabla(arrBtns) {
    const celdaAcciones = document.createElement('td');
    
    const blockBtns = document.createElement('div');
    blockBtns.id = 'acciones'
    blockBtns.classList.add('col-10', 'justify-content-around');

    for (let i = 0; i < arrBtns.length; i++) {
        const { idBtn, texto, dataSet, eventListeners, clasesCSS} = arrBtns[i];
        
        // Creo boton con un ID, clases CSS y le asigno una funcion
        const btn = document.createElement('button');
        btn.id = idBtn;
        btn.className = clasesCSS;
        btn.textContent = texto;
        btn.dataset.articulo = dataSet;
        btn.addEventListener('click', eventListeners);
        blockBtns.appendChild(btn)
        
        celdaAcciones.appendChild(blockBtns );
    }


    return celdaAcciones;
}


export function vincularBtnCerrarSesion(){
    const btnCerrarSesion = document.querySelector('#btnLogout') || null;
    btnCerrarSesion.addEventListener('click', cerrarSesion);
}