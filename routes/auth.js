const { Router } = require('express');  
const { check } = require('express-validator');

const { validarCampos, validarSesionUsuario } = require('../middlewares');

const { login } = require('../controllers/auth');



const router = Router();

router.post('/login',[
    check('correo', 'El correo es obligatorio').isEmail(),
    check('password', 'La contraseña es obligatorio').not().isEmpty(),
    // validarSesionUsuario,
    validarCampos
], login ); //GET


module.exports = router;