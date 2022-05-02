const { Router } = require('express');
const { check } = require('express-validator');

// const { validarCampos } = require('../middlewares/validar-campos.js');
// const { validarJWT } = require('../middlewares/validar-jwt.js');
// const { esAdminRole, tieneRole } = require('../middlewares/validar-roles.js');

const { 
    validarCampos,
    validarJWT,
    tieneRole,
    esAdminRole
} = require('../middlewares');

const { esRoleValido, emailExiste, existeUsuarioPorID } = require('../helpers/db-validators');

const {
    getUsuarios,
    postUsuarios,
    putUsuarios,
    patchUsuarios,
    deleteUsuarios,
} = require('../controllers/usuarios.js');



const router = Router();

 
/* router.get('/', (req, res) => {
    res.json({
        msg: "get API"
    })
}) */         //Esta ruta contiene un callback como CONTROLADOR, hay que separarlo.


//Ejemplo de ruta y controlador SEPARADOS
router.get('/', getUsuarios ); //GET

router.post('/',[
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe tener mas de 6 caracteres').isLength({ min: 4 }),
    check('correo', 'El correo no es valido').isEmail(),
    // check('rol', 'El rol no es valido').isIn(['ADMIN_ROLE', 'USER_ROLE']),
    check('correo').custom( emailExiste ),
    check('rol').custom( esRoleValido ),
    validarCampos
], postUsuarios ); //POST

router.put('/:id',[
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( existeUsuarioPorID ),
    check('rol').custom( esRoleValido ),
    validarCampos
], putUsuarios ); //PUT

router.patch('/', patchUsuarios ); //PATCH

router.delete('/:id',[
    validarJWT,
    // esAdminRole,
    tieneRole('ADMIN_ROLE', 'USER_ROLE'),
    check('id', 'No es un ID valido').isMongoId(),
    check('id').custom( existeUsuarioPorID ),
    validarCampos
], deleteUsuarios ); // DELETE



module.exports = router;