
const login = document.querySelector('#login');
const URL = 'http://localhost:8080';


cargarEventListenners();
function cargarEventListenners() {
    login.addEventListener('submit', validarLogin);
}



function validarLogin( e ) {
    e.preventDefault();
    const correo = document.querySelector('#correo');
    const password = document.querySelector('#password');
    correo.value   = 'test1@gmail.com',
    password.value = 'test1';

    if( correo.value === '' || password.value === '' ){
        mostrarMsj('danger', 'Todos los campos son obligatorios');
        return;
    }

    const datosUsuario = {
        correo : correo.value,
        password : password.value
    };

    enviarLogin( datosUsuario );
}


const enviarLogin = async( datosUsuario ) => {
    try {
        const resp = await fetch( `${URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify( datosUsuario ),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const datosSesion = await resp.json();
        console.log(datosSesion);
        
        if( resp.status !== 400 ){
            const { token, msg } = datosSesion;
            
            localStorage.setItem( 'x-token', JSON.stringify(token) );
            mostrarMsj('success', msg);

            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        } else {
            mostrarMsj('danger', msg);
        }   

    } catch (error) {   
        console.log(error);
        return error;
    }
}

function mostrarMsj( clase, msj ) {
    // verifico si ya existe la alerta (asi no se repite...)
    const existeAlerta = document.querySelector('.alert');
    if( existeAlerta ){
        return;
    } 

    const bloqueMsj = document.createElement('div');
    bloqueMsj.classList.add('alert', `alert-${clase}`);
    bloqueMsj.textContent = msj;

    login.appendChild( bloqueMsj );

    setTimeout(() => {
        bloqueMsj.remove();
    }, 2000);
}

