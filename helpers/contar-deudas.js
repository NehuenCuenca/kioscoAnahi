


const calcularDeudaTotal = ( historial ) => {
    const { enContra, aFavor } = historial;
    let enContraTotal, aFavorTotal = 0;


    if( enContra.length > 0 ){
        enContraTotal =  enContra.reduce( (acum, deuda) => acum + deuda.precio, 0);
    };


    if( aFavor.length > 0 ){
        aFavorTotal  = aFavor.reduce( (acum, deuda) => acum + deuda.precio, 0);
    };
    
    return enContraTotal - aFavorTotal;
}

const calcularDeudaTotal2 = ( historial ) => {
    let enContraTotal, aFavorTotal = 0;

    historial.forEach( bloqueDeuda => {
        const { enContra, aFavor } = bloqueDeuda;

        enContraTotal = enContra.reduce( (acum, deuda) => acum + deuda.precio, 0);
        aFavorTotal = aFavor.reduce( (acum, deuda) => acum + deuda.precio, 0);
    });

    return enContraTotal - aFavorTotal;
}


module.exports = {
    calcularDeudaTotal,
    calcularDeudaTotal2
}






// OBTENER DEUDORES RESPONSE 1:
// {
//     "msg": "Lista de deudor exitosa",
//     "total": 1,
//     "deudores": [
//         {
//             "_id": "6269d8bb58c4aaa8bd0ebc27",
//             "cliente": {
//                 "_id": "626951a8c571ce08682b404c",
//                 "nombre": "Test 7",
//                 "apellido": "7"
//             },
//             "deudaTotal": 100,
//             "historial": [
//                 {
//                     "enContra": [
//                         {
//                             "articulo": "626951a4c571ce08682b404a",
//                             "precio": 20
//                         },
//                         {
//                             "articulo": "626951a4c571ce08682b404a",
//                             "precio": 80
//                         },
//                         {
//                             "articulo": "626951a4c571ce08682b404a",
//                             "precio": 100
//                         }
//                     ],
//                     "aFavor": [
//                         {
//                             "articulo": "626951a4c571ce08682b404a",
//                             "precio": 100
//                         }
//                     ]
//                 }
//             ]
//         }
//     ]
// }
