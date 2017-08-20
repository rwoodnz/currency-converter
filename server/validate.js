'use strict';

const joi = require('joi');

const query = (query, symbols) => {

    // Symbol list is dynamic, so this schema is reset for each validation
    const schema = {
        amount: joi.number().positive().required(),
        from: joi.any().valid(symbols).required(),
        to: joi.any().valid(symbols).required()
    };

    return joi.validate(query, schema, { abortEarly: false }).error;
}

const currenciesSchema = joi.object().pattern(/^[A-Z]{3}$/, joi.string());

const ratesSchema = joi.object().keys({
    rates: joi.object().pattern(/^[A-Z]{3}$/, joi.number().positive()),
    disclaimer: joi.any(),
    license: joi.any(),
    timestamp: joi.any(),
    base: joi.any()
});

const json = (jsonBody, schema) => joi.validate(jsonBody, schema, { abortEarly: false }).error;

module.exports = {
    query,
    json,
    ratesSchema,
    currenciesSchema
};
