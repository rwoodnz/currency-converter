'use strict';

var http = require('http');

const currencyDataUrl = 'http://openexchangerates.org/api/latest.json';
const currencyDataKey = '618a01bc477c4f0db5ff8f5aac15625b'

const Joi = require('joi');
const schema = Joi.object().pattern(/^[A-Z]{3}$/, Joi.number().positive())

function retrieveRates (done) {

    let url = currencyDataUrl + '?app_id=' + currencyDataKey

    http.get(url, function (res) {

        let body = '';
        let rates = {}
        
        res.on('data', function (data) {
            body += data;
        });

        res.on('end', function () {
            let err = null;
            let rates = [];

            if (body.length === 0) {
                err = { RatesRetrievalError: "Got an empty list" }
            } else {
                try {
                    let currencyData = JSON.parse(body);
                    rates = currencyData.rates;
                    let { error, value } = Joi.validate(rates, schema);
                    if (error) {
                        err = { RatesRetrievalError: error.details };
                    }
                } catch (e) {
                    err = { RatesRetrievalError: e.message }
                };
            }

            done(err, rates);
        });
    })
    .on('error', function (e) {
        done( { RatesRetrievalError: e.message }, [] );
    });

}

module.exports = retrieveRates;