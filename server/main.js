'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
const location = { port: 3000, host: 'localhost' };

const retrieveRates = require('./retrieve-rates.js');
const convert = require('./convert.js');
const validate = require('./validate.js');
const history = require('./history.js');

history.ensureStatisticsFileExists();

server.connection(location);

server.route({

    method: 'GET',
    path: '/',
    handler: function (request, reply) {

        retrieveRates(handleConversion);

        function handleConversion(err, rates) {

            if (err !== null) {
                console.error(err);
                return reply(JSON.stringify(err));
            } else {
                let symbols = Object.keys(rates);
                let validationError = validate(request.query, symbols);

                if (validationError !== null) {
                    console.error(validationError);
                    return reply(JSON.stringify(validationError));
                } else {
                    let result = convert(rates, request.query);
                    let USDAmount = convert(rates, { amount: request.query.amount, from: request.query.from, to: 'USD' })

                    history.updateStats(request.query.to, USDAmount, returnUpdate);

                    function returnUpdate(err, update) {
                        if (err) {
                            return reply(JSON.stringify(err))
                        } 
                        // Add result to update data
                        update.result = result;
                        console.log(update)
                        return reply(update)
                    }
                }
            }
        }
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
