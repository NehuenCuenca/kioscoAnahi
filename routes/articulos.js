const { Router } = require('express');
const { check }  = require('express-validator');



const { 
    crearArticulo,
    obtenerArticulos,
    obtenerArticulo,
    modificarArticulo,
    eliminarArticulo
} = require('../controllers/articulos');


const router = Router();

// Obtener articulos
router.get('/', obtenerArticulos);


// OBtener articulo por ID
router.get('/:id', obtenerArticulo);


// Crear articulo - aplicar middlewares
router.post('/', crearArticulo);


// Modificar/actualizar articulo
router.put('/:id', modificarArticulo);


// Borrar articulo - middleware rolAdmin
router.delete('/:id', eliminarArticulo);



module.exports = router;