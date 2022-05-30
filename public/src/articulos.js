import { traerDatosAPI } from '../src/funciones-API.js'

document.addEventListener('DOMContentLoaded', () => {
    traerArticulos()
});


async function traerArticulos(){
    const { resp, data: { articulos } } = await traerDatosAPI('articulos');

    const articulosLimpios = articulos.map( articulo => {
        const { estado, ...resto } = articulo;
        return { ...resto };
    });

    return articulosLimpios;
}


