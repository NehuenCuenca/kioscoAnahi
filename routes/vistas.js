const { Router } = require('express');
const { check }  = require('express-validator');

const { validarCampos, validarJWT } = require('../middlewares');

const { verificarToken } = require('../controllers/tokens');



const router = Router();

// Crear cliente - aplicar middlewares
router.post('/', [
    validarJWT,
    validarCampos
], verificarToken);


module.exports = router;