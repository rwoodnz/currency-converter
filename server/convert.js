'use strict';

module.exports = (rates, query) => query.amount * (rates[query.to] / rates[query.from]);
