'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const Boom = require('boom');

const Retrieve = require('./retrieve.js');
const Convert = require('./convert.js');
const Validate = require('./validate.js');
const History = require('./history.js');

History.ensureStatisticsFileExists();

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

const location = { port: 3000, host: 'localhost' };

server.connection(location);

server.register(Inert, () => { });

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true,
            index: true
        }
    }
});

server.route({
    method: 'GET',
    path: '/currencies',
    handler: function(request, reply) {

        Retrieve.currencies(getCurrencies)

        function getCurrencies(err, currencies) {
            if (err != null) {
                console.error(err);
                return reply(Boom.badImplementation(JSON.stringify(err)));
            } else {
                return reply(currencies);
            }
        }
    }
})

server.route({
    method: 'GET',
    path: '/statistics',
    handler: function (request, reply) {

        History.readStatistics(getStatistics)

        function getStatistics(readErr, statistics) {
            if (readErr) {
                console.error(readErr);
                return reply(Boom.badImplementation(JSON.stringify(readErr)));
            } else {
                return reply(statistics);
            }
        }
    }
})

server.route({
    method: 'GET',
    path: '/convert',
    handler: function (request, reply) {

        // Always get the latest rates
        Retrieve.rates(validateQuery);

        function validateQuery(err, ratesPackage) {

            if (err) {
                console.error(err);
                return reply(Boom.badImplementation(JSON.stringify(err)));
            } else {
                let symbols = Object.keys(ratesPackage.rates);
                let validationError = Validate.query(request.query, symbols);

                if (validationError) {
                    console.error(validationError);
                    return reply(Boom.badRequest(JSON.stringify(validationError.details)));
                } else {
                    processStatistics(ratesPackage.rates, request.query)
                }
            }

            function processStatistics(rates, query) {
                let USDAmount = Convert(rates, { amount: query.amount, from: query.from, to: 'USD' });

                History.readStatistics(updateStatistics)

                function updateStatistics(readErr, existingStatistics) {
                    if (readErr) {
                        console.error(readErr);
                        return reply(Boom.badImplementation(JSON.stringify(readErr)));
                    }
                    let updatedStatistics = History.calculateUpdate(existingStatistics, query.to, USDAmount)
                    History.writeStatistics(updatedStatistics, processQuery)
                }
            }

            function processQuery(writeErr, update) {
                if (writeErr) {
                    console.error(writeErr);
                    return reply(Boom.badImplementation(JSON.stringify(writeErr)));
                }
                // Combine conversion result with update data
                update.result = Convert(ratesPackage.rates, request.query);;

                return reply(update);
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
