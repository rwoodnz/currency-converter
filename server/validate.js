'use strict';

const Joi = require('joi');

const currenciesSchema = Joi.object().pattern(/^[A-Z]{3}$/, Joi.string());
const ratesSchema = Joi.object().keys({
    rates: Joi.object().pattern(/^[A-Z]{3}$/, Joi.number().positive()),
    disclaimer: Joi.any(),
    license: Joi.any(),
    timestamp: Joi.any(),
    base: Joi.any()
});

function query (query, symbols) {

    // Symbol list is dynamic, so this schema is reset for each validation
    let schema = {
        amount: Joi.number().positive().required(),
        from: Joi.any().valid(symbols).required(),
        to: Joi.any().valid(symbols).required()
    };

    let { error, value } = Joi.validate(query, schema, { abortEarly: false });
    return error;
}

function json (jsonBody, schema) {
    let { error, value } = Joi.validate(jsonBody, schema, { abortEarly: false });
    return error;
}

module.exports = {
    query: query,
    json: json,
    ratesSchema: ratesSchema,
    currenciesSchema: currenciesSchema
};
