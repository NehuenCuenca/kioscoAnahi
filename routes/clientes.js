const { Router } = require('express');
const { check }  = require('express-validator');

const { validarCampos } = require('../middlewares');

const { existeClientePorID } = require('../helpers/db-validators');

const { 
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    eliminarCliente,
    modificarCliente,
} = require('../controllers/clientes');



const router = Router();


// Obtener clientes
router.get('/', obtenerClientes);


// OBtener cliente por ID
router.get('/:id',[
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( existeClientePorID ),
    validarCampos
], obtenerCliente);


// Crear cliente - aplicar middlewares
router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    validarCampos
], crearCliente);


// Modificar/actualizar cliente
router.put('/:id',[
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( existeClientePorID ),
    validarCampos
], modificarCliente);


// Borrar cliente - middleware rolAdmin
router.delete('/:id',[
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( existeClientePorID ),
    validarCampos
], eliminarCliente);




module.exports = router;