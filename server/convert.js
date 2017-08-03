'use strict';

var convert = function(currencyData, amount, from, to) { 

    return amount * currencyData[to] / currencyData[from]

}

module.exports = convert;