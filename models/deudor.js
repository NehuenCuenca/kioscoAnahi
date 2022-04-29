const { Schema, model } = require('mongoose'); 

const DeudorSchema = Schema({
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    deudaTotal: {
        type: Number,
        default: 0
    },
    historial: {
        type: Array,
        default: 0
    }
});

DeudorSchema.methods.toJSON = function() {
    const { __v, ...deudor } = this.toObject();    
    return deudor;
}

module.exports = model( 'Deudor', DeudorSchema );