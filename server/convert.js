'use strict';

function convert(rates, query) { 

    return query.amount * rates[query.to] / rates[query.from]

}

module.exports = convert;