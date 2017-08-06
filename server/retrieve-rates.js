'use strict';

var http = require('http');

const currencyDataUrl = 'http://openexchangerates.org/api/latest.json';
const currencyDataKey = '618a01bc477c4f0db5ff8f5aac15625b'

const Joi = require('joi');
const schema = Joi.object().pattern(/^[A-Z]{3}$/, Joi.number().positive());

function retrieveRates (done) {

    let url = currencyDataUrl + '?app_id=' + currencyDataKey;

    http.get(url, function (res) {

        let body = '';
        let rates = {};
        
        res.on('data', function (data) {
            body += data;
        });

        res.on('end', function () {
            let err = null;
            let rates = {};

            try {
                let currencyData = JSON.parse(body);
                rates = currencyData.rates;
                let { error, value } = Joi.validate(rates, schema);
                if (error) {
                    console.error(error);
                    done(error.details);
                }
            } catch (e) {
                done(e.message);
            };

            done(err, rates);
        });
    })
    .on('error', function (e) {
        done(e.message);
    });

}

module.exports = retrieveRates;