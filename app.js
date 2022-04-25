/* 
ORDEN DE LAS IMPORTACIONES DE ARCHIVOS ( REQUIRE('') ).
    1ro - las importaciones propias de NODE, por ejemplo FS,http,etc.
    2do - los paquetes de terceros como dotenv, express, etc.
    3ro - nuestros archivos propios (los que creamos), por ejemplo el rqr de Models, helpers(funciones q creamos)
*/

require('dotenv').config();
const Server = require('./models/server.js');


const server = new Server();
server.listen(); //inicio el server





