'use strict';

const axios = require('axios');

const currenciesUrl = 'http://openexchangerates.org/api/currencies.json';
const ratesUrl = 'http://openexchangerates.org/api/latest.json';
const ratesDataKey = '618a01bc477c4f0db5ff8f5aac15625b'

const currencies = done => axios.get(currenciesUrl);

const rates = done => {
    let url = ratesUrl + '?app_id=' + ratesDataKey;
    return axios.get(url);
}

module.exports = { 
    currencies,
    rates
}
