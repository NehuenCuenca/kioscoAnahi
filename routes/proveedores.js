const { Router } = require('express');
const { check }  = require('express-validator');

const { validarCampos, validarJWT, tieneRole  } = require('../middlewares');

const { existeProveedorPorID } = require('../helpers/db-validators');

const { 
    obtenerProveedores,
    obtenerProveedor,
    crearProveedor,
    modificarProveedor,
    eliminarProveedor
} = require('../controllers/proveedores');


const router = Router();

// Obtener Proveedores
router.get('/', obtenerProveedores);


// OBtener Proveedor por ID
router.get('/:id', obtenerProveedor);


// Crear Proveedor - aplicar middlewares
router.post('/',[
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    validarCampos
], crearProveedor);


// Modificar/actualizar Proveedor
router.put('/:id',[
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( existeProveedorPorID ),
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('apellido', 'El apellido es obligatorio').not().isEmpty(),
    validarCampos
], modificarProveedor);


// Borrar Proveedor - middleware rolAdmin
router.delete('/:id', [
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( existeProveedorPorID ),
    validarCampos
], eliminarProveedor);



module.exports = router;