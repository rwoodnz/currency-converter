'use strict';

const path = require('path');
const hapi = require('hapi');
const inert = require('inert');
const boom = require('boom');

const retrieve = require('./retrieve.js');
const convert = require('./convert.js');
const validate = require('./validate.js');
const history = require('./history.js');

history.ensureStatisticsFileExists();

const server = new hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: path.join(__dirname, 'public')
            }
        }
    }
});

const location = { port: 3000, host: 'localhost' };

server.connection(location);

server.register(inert, () => { });

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
    handler: (request, reply) => {

        const getCurrencies = (err, currencies) => {
            if (err != null) {
                console.error(err);
                return reply(boom.badImplementation(JSON.stringify(err)));
            } else {
                return reply(currencies);
            }
        }

        retrieve.currencies(getCurrencies)
    }
})

server.route({
    method: 'GET',
    path: '/statistics',
    handler: (request, reply) => {

        try {
            let statistics = history.readStatistics()
            return reply(statistics);
        } catch (readErr) {
            console.error(readErr);
            return reply(boom.badImplementation(JSON.stringify(readErr)));
        }
        
    }
})

server.route({
    method: 'GET',
    path: '/convert',
    handler: (request, reply) => {

        const processStatistics = (rates, query) => {
            let USDAmount = convert(rates, { amount: query.amount, from: query.from, to: 'USD' });

            let existingStatistics;
            try {
                existingStatistics = history.readStatistics();
            } catch (readErr) {
                console.error(readErr);
                return reply(boom.badImplementation(JSON.stringify(readErr)));
            }
            
            let update = history.calculateUpdate(existingStatistics, query.to, USDAmount)

            try {
                history.writeStatistics(update);
            } catch (writeErr) {
                console.error(writeErr);
                return reply(boom.badImplementation(Json.stringify(writeErr)));
            }

            update.result = convert(rates, request.query);

            return reply(update);
        }

        const validateQuery = (validationError, ratesPackage) => {

            if (validationError) {
                console.error(err);
                return reply(boom.badImplementation(JSON.stringify(err)));
            } else {
                let symbols = Object.keys(ratesPackage.rates);
                let validationError = validate.query(request.query, symbols);

                if (validationError) {
                    console.error(validationError);
                    return reply(boom.badRequest(JSON.stringify(validationError.details)));
                } else {
                    processStatistics(ratesPackage.rates, request.query)
                }
            }
        }

        // Always get the latest rates
        retrieve.rates(validateQuery);

    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
