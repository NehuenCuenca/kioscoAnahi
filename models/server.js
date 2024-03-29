const express = require('express');
const cors = require('cors');

const { conexionDB } = require('../database/config');

class Server {

    constructor(){
        this.app = express(); //creo una app de express cuando se instancie la clase Server
        this.port = process.env.PORT; //el process.env.PORT es variable global en node
        
        this.paths = {
            auth :      '/api/auth',
            articulos:  '/api/articulos',
            clientes :  '/api/clientes',
            deudores :  '/api/deudores',
            proveedores: '/api/proveedores',
            usuarios :  '/api/usuarios',
            vistas :  '/api/tokens',
        };

        // Conectar a la BD
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // rutas de la app
        this.routes();
    }

    async conectarDB() {
        await conexionDB();
    }

    middlewares() {

        // CORS
        this.app.use( cors() ); 

        // Lectura y parseo del body (serializa la info que viene de un POST,PUT O DELETE a formato JSON)
        this.app.use( express.json() );

        // Directorio publico
        this.app.use( express.static('public') );
    }

    // configuracion de rutas
    routes() {
        this.app.use( this.paths.auth, require('../routes/auth.js') );
        this.app.use( this.paths.articulos, require('../routes/articulos.js') );
        this.app.use( this.paths.clientes, require('../routes/clientes.js') );
        this.app.use( this.paths.deudores, require('../routes/deudores.js') );
        this.app.use( this.paths.proveedores, require('../routes/proveedores.js') );
        this.app.use( this.paths.usuarios, require('../routes/usuarios.js') );
        this.app.use( this.paths.vistas, require('../routes/vistas.js') );
    }

    listen(){
        this.app.listen( this.port, () => {
            console.log("Servidor corriendo en el puerto: ", this.port);
        });
    }

}

module.exports = Server;