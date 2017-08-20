'use strict';

const http = require('http');

const currenciesUrl = 'http://openexchangerates.org/api/currencies.json';
const ratesUrl = 'http://openexchangerates.org/api/latest.json';
const ratesDataKey = '618a01bc477c4f0db5ff8f5aac15625b'

const joi = require('joi');
const Validate = require('./validate.js');

const currencies = done => retrieveValid(currenciesUrl, Validate.currenciesSchema, done);

const rates = done => {
    let url = ratesUrl + '?app_id=' + ratesDataKey;
    return retrieveValid(url, Validate.ratesSchema, done);
}

const retrieveValid = (url, schema, done) => {
    http.get(url, function (res) {
        let body = '';
        let result = {};

        res.on('data', function (data) {
            body += data;
        });

        res.on('end', function () {
            let err = null;
            let jsonBody = {};

            try {
                jsonBody = JSON.parse(body);

                const error = Validate.json(jsonBody, schema)

                if (error) {
                    done(error.details);
                }
            } catch (e) {
                done(e.message);
            };
            done(err, jsonBody);
        });
    })
    .on('error', function (e) {
        done(e.message);
    });
}

module.exports = { 
    currencies,
    rates
}
