export function crearModal( accion, coleccion = '' ){
    const modal = document.createElement('div');
    modal.id = `modal${accion}`;
    modal.classList.add('modal', 'fade', 'show');
    modal.style.display = 'block';
    modal.role = 'dialog';

    modal.innerHTML += `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header justify-content-center text-capitalize">
                    <h5 class="modal-title" id="modal${accion}">${accion} ${coleccion}</h5>
                </div>

                <div class="modal-body"></div>

                <div class="modal-footer align-items-center justify-content-center">
                    <button type="button" id="btnCerrarModal" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}


export function crearSombraModal() {
    const modalShadow = document.createElement('div');
    modalShadow.id = 'modalShadow';
    modalShadow.classList.add('modal-backdrop', 'fade', 'show');

    return modalShadow;
}


export function cerrarModal(idModal) {
    // Remuevo el modal y sombra
    document.querySelector(`#${idModal}`).remove(); 
    document.querySelector(`#modalShadow`).remove(); 
}


export function crearFormClientes(){
    const form = document.createElement('form');

    form.innerHTML += `
        <div class="row justify-content-md-center my-3">
            <div class="col-md-6 mb-3">
                <label for="nombre" class="form-label fw-bold">Nombre</label>
                <input type="text" class="form-control" id="nombre" placeholder="Nombre del cliente">
            </div>
            <div class="col-md-6 mb-3">
                <label for="apellido" class="form-label fw-bold">Apellido</label>
                <input type="text" class="form-control" id="apellido" placeholder="Apellido del cliente">
            </div>
        </div>
        <div class="row justify-content-md-center my-3">
            <div class="col-md-6 mb-3">
                <label for="telefono" class="form-label fw-bold">Telefono</label>
                <input type="text" class="form-control" id="telefono" placeholder="Telefono o celular">
            </div>
            <div class="col-md-6 mb-3">
                <label for="direccion" class="form-label fw-bold">Direccion</label>
                <input type="text" class="form-control" id="direccion" placeholder="Direccion o domicilio">
            </div>
        </div>
        
        <div class="row justify-content-md-center my-2">
            <div class="col-md-5 justify-content-between">
                <button id="btnGuardar" type="submit "class="btn btn-success"> Guardar </button>
                <button id="btnCancelar" class="btn btn-danger"> Cancelar </button>
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

// TODO: REHACER
export function crearColumnasDeudas() {
    const blockCrearDeuda = document.createElement('div');
    blockCrearDeuda.classList.add('row', 'my-3', 'justify-content-around', 'p-2', 'row', 'col-12', 'text-center', 'justify-content-center', 'border', 'border-secondary', 'p-2', 'text-white');
    blockCrearDeuda.id = 'blockCrearDeuda';

    blockCrearDeuda.innerHTML = `
        <div id="blockCliente" class="row col-4 my-3 justify-content-center">
            <select id="listaClientes" class="row">
                <option value="" selected>Seleccione un cliente</option>
            </select>
            <input type="text"  id="inputCliente" class="row" placeholder="Si no existe en la lista, crea uno nuevo aca..">
        </div>

        <div class="row col-12 justify-content-around">
            <div class="col-5 bg-danger mh-auto" id="blockEnContra">
                EN CONTRA
                <div class="row col py-3 justify-content-center">
                    <button id="btnSumarArticuloEnContra" class="btn btn-primary col-6"> Sumar articulo </button>
                </div>
            </div>

            <div class="col-5 bg-success mh-auto" id="blockAFavor">
                A FAVOR
                <div class="row col py-3 my-1 justify-content-center">
                    <button id="btnSumarArticuloAFavor" class="btn btn-primary col-6"> Sumar articulo </button>
                </div>
            </div>
        </div>

        <div id="btnGuardarDeuda" class="row col-4 my-3 justify-content-center">
          <button class="btn btn-success">Guardar</button>
        </div>
    `;
    
    return blockCrearDeuda;
}


export function sumarArticuloDeuda( columna ) {
    const blockNuevoArticuloDeuda = document.createElement('div');
    blockNuevoArticuloDeuda.classList.add('row', 'my-3', 'justify-content-around', 'p-2');

    const nroArticuloDeuda = Array.from( columna.querySelectorAll('div[id^="blockArticuloDeuda"]') ).length;
    blockNuevoArticuloDeuda.id = `blockArticuloDeuda${nroArticuloDeuda}`;

    blockNuevoArticuloDeuda.innerHTML += `
        <div class="row col-5 justify-content-center bg-primary">
            <select id="listaArticulo"  class="row col-12">
                <option value="">Seleccione un articulo</option>
            </select>
            <input type="text" id="articuloDeuda" class="row col-12" placeholder="Si no existe en la lista, crea uno nuevo aca..">
        </div>

        <div class="col-3 bg-success d-flex align-items-center justify-content-center">
            <input type="number" placeholder="Precio" id="precioArticulo" class="col-12" min="0">
        </div>

        <div class="col-1 d-flex align-items-center justify-content-center">
            <button id="btnBorrarArticulo" class="btn btn-dark col"> X </button>
        </div>
    `;

    columna.appendChild( blockNuevoArticuloDeuda );
}


export function cargarSelectClientes( select, clientes ){
    for (let i = 0; i < clientes.length; i++) {
        const { nombre, apellido, _id} = clientes[i];

        const option = document.createElement('option');
        option.textContent = `${nombre} ${apellido}`;
        option.value = _id;

        select.appendChild( option );
    }

    return;
}


export function cargarSelectArticulos( select, articulos ){
    for (let i = 0; i < articulos.length; i++) {
        const { nombre, _id} = articulos[i];

        const option = document.createElement('option');
        option.textContent = `${nombre}`;
        option.value = _id;

        select.appendChild( option );
    }

    return;
}