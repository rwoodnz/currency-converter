'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
const location = { port: 3000, host: 'localhost' }

const retrieveRates = require('./retrieve-rates.js');
const convert = require('./convert.js');
const validate = require('./validate.js')

server.connection(location);

server.route({

    method: 'GET',
    path: '/',
    handler: function (request, reply) {

        retrieveRates(handleConversion);

        function handleConversion(err, rates) {

            console.log(request.query);

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
                    let result = convert(
                        rates,
                        request.query.amount,
                        request.query.from,
                        request.query.to
                    )
                    console.log(result);
                    return reply(result);
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
