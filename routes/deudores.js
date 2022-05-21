const { Router } = require('express');
const { check, body }  = require('express-validator');

const { validarCampos, validarJWT, tieneRole } = require('../middlewares');

const { existeClientePorID } = require('../helpers/db-validators');

const { 
    obtenerDeudores,
    obtenerDeudor,
    crearDeudor,
    modificarDeudor,
    eliminarDeudor,
} = require('../controllers/deudores');



const router = Router();

// Obtener deudores
router.get('/', obtenerDeudores);


// OBtener deudor por ID
router.get('/:id', obtenerDeudor);


// Crear deudor - aplicar middlewares
router.post('/',[
    validarJWT,
    tieneRole('ADMIN_ROLE','VENTAS_ROLE', 'USER_ROLE'),
    check('historial', 'El historial es obligatorio').not().isEmpty(),
    check('cliente', 'El cliente es obligatorio').not().isEmpty(),
    check('cliente', 'No es un ID valido').isMongoId(),
    check('cliente').custom( existeClientePorID ),
    validarCampos
], crearDeudor);


// Modificar/actualizar deudor
router.put('/:id',[
    validarJWT,
    tieneRole('ADMIN_ROLE','VENTAS_ROLE', 'USER_ROLE'),
    check('historial', 'El historial es obligatorio').not().isEmpty(),
    check('cliente', 'El cliente es obligatorio').not().isEmpty(),
    check('cliente', 'No es un ID valido').isMongoId(),
    check('cliente').custom( existeClientePorID ),
    validarCampos
], modificarDeudor);


// Borrar deudor - middleware rolAdmin
router.delete('/:id',[
    validarJWT,
    tieneRole('ADMIN_ROLE', 'VENTAS_ROLE', 'USER_ROLE'),
    // check('historial', 'El historial es obligatorio').not().isEmpty(),
    // check('cliente', 'El cliente es obligatorio').not().isEmpty(),
    // check('cliente', 'No es un ID valido').isMongoId(),
    // check('cliente').custom( existeClientePorID ),
    validarCampos
], eliminarDeudor);




module.exports = router;