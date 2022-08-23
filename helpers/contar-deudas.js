

const calcularDeudaTotal2 = ( historial ) => {
    let enContraTotal = 0;
    let aFavorTotal = 0;
    
    historial.forEach( bloqueDeuda => {
        const { enContra, aFavor } = bloqueDeuda;

        enContraTotal = enContra.reduce( (acum, deuda) => acum + deuda.precio, enContraTotal);
        aFavorTotal   = aFavor.reduce( (acum, deuda) => acum + deuda.precio, aFavorTotal);
    });
    
    return enContraTotal - aFavorTotal;
}


module.exports = {
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
