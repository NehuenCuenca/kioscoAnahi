const { Router } = require('express');  
const { check, body } = require('express-validator');

const { validarCampos, validarJWT, validarSesionUsuario } = require('../middlewares');

const { login, logout } = require('../controllers/auth');


const router = Router();



router.post('/login',[
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatorio').not().isEmpty(),
    // validarSesionUsuario,
    validarCampos
], login );


router.post('/logout',[
    // validarSesionUsuario,
    // validarJWT,
    body('x-token', 'El token es obligatorio en la peticion(request)').not().isEmpty(),
    validarCampos
], logout );


module.exports = router;