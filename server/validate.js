'use strict';

const Joi = require('joi');

var validate = function(query, symbols) {

    // Symbol list is dynamic, so schema is reset for each validation
    let schema = {
        amount: Joi.number().positive().required(),
        from: Joi.any().valid(symbols).required(),
        to: Joi.any().valid(symbols).required()
    };
    var { error, value } = Joi.validate(query, schema, { abortEarly: false });

    return error 
        ? { ValidationError: error.details } 
        : null
}

module.exports = validate;
