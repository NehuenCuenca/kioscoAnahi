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

export function crearBlockDeuda(){
    const blockDeuda = document.createElement('div');
    blockDeuda.classList.add('row', 'my-3', 'border', 'border-secondary');

    blockDeuda.innerHTML += `
        <h3 id="fechaDeuda"></h3>

        <div class="col-md-6 justify-content-center mb-3">
            <h5>A FAVOR</h5>
            <div id="aFavor" class="border border-success rounded p-3 bg-success text-white fs-5"></div>
        </div>

        <div class="col-md-6 justify-content-center mb-3">
            <h5>EN CONTRA</h5>
            <div id="enContra" class="border border-danger rounded p-3 bg-danger text-white fs-5"></div>
        </div>
    `;

    return blockDeuda;
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


export function crearBlockDeudaNueva() {
    const blockCrearDeuda = document.createElement('div');
    blockCrearDeuda.classList.add('row', 'border', 'border-secondary', 'p-3', 'my-4', 'justify-content-center', 'text-white');
    blockCrearDeuda.id = 'blockCrearDeuda';

    blockCrearDeuda.innerHTML = `
            <div id="blockCliente" class="row my-3 justify-content-around">
                <select name="" id="listaClientes" class="col-4">
                    <option value="" selected>Seleccione un cliente</option>
                </select>
                <input type="text"  id="inputCliente" class="col-4" placeholder="Si no existe en la lista, crea uno nuevo aca..">
            </div>

            
            <div id="blockArticuloDeuda" class="row my-3 justify-content-between">
                <div class="row col-4 justify-content-center bg-primary">
                    <select id="listaArticulo"  class="row col-10">
                        <option value="">Seleccione un articulo</option>
                        <option value="Articulo random">Chesterfield</option>
                        <option value="Articulo random">Coca COLA 2L</option>
                    </select>
                    <input type="text" id="articuloDeuda" class="row col-10" placeholder="Si no existe en la lista, crea uno nuevo aca..">
                </div>
                
                <div class="col-2 bg-success d-flex align-items-center justify-content-center">
                    <input type="text" placeholder="Precio" id="precioArticulo" class="col-8">
                </div>
                
                <div id="blockChecks" class="col-3 d-flex align-items-center justify-content-center">
                    <select id="selectDeuda" class="col-8">
                        <option value="enContra" selected> EN CONTRA del cliente</option>
                        <option value="aFavor"> A FAVOR del cliente</option>
                    </select>
                </div>

                <div class="col-3 d-flex align-items-center">
                    <button id="btnBorrarArticulo" class="btn btn-danger btn-sm col-3"> X </button>
                </div>
            </div>

            <div class="row col-12 py-3 my-4 justify-content-center">
                <button id="btnSumarArticulo" class="btn btn-primary col-4"> Sumar otro articulo </button>
            </div>

            <div class="row col-9 py-3 my-4 justify-content-between">
                <button id="btnGuardarDeuda" class="btn btn-success col-4"> Guardar deuda </button>
                <button id="btnCancelarDeuda" class="btn btn-danger col-4"> Cancelar </button>
            </div>
    `;
    
    return blockCrearDeuda;
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