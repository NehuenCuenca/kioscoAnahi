


const validaCampos = require('../middlewares/validar-campos.js');
const validaJWT = require('../middlewares/validar-jwt.js');
const validaRoles = require('../middlewares/validar-roles.js');


module.exports = {
    ...validaCampos,
    ...validaJWT,
    ...validaRoles,
}