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

const query = (query, symbols) => {

    // Symbol list is dynamic, so this schema is reset for each validation
    const schema = {
        amount: Joi.number().positive().required(),
        from: Joi.any().valid(symbols).required(),
        to: Joi.any().valid(symbols).required()
    };

    return Joi.validate(query, schema, { abortEarly: false }).error;
}

const json = (jsonBody, schema) => Joi.validate(jsonBody, schema, { abortEarly: false }).error;

module.exports = {
    query,
    json,
    ratesSchema,
    currenciesSchema
};
