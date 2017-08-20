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

        retrieve.currencies().then((response) => {

            let error = validate.json(response.data, validate.currenciesSchema)

            if (error) {
                return reply(boom.badImplementation(JSON.stringify(error)));
            }
            return reply(response.data);

        }, (errorMessage) => {

            console.error(errorMessage);
            return reply(boom.badImplementation(JSON.stringify(errorMessage)));

        }).catch((e) => {
            if (e.code === 'ENOTFOUND') {
                console.error('Unable to connect to API service')
            } else {
                console.error(e.message)
            }
        });
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

        // Always get the latest rates
        retrieve.rates().then((response) => {

            let error = validate.json(response.data, validate.ratesSchema)

            if (error) {
                return reply(boom.badImplementation(JSON.stringify(error)));
            }

            let symbols = Object.keys(response.data.rates);
            let validationError = validate.query(request.query, symbols);

            if (validationError) {
                console.error(validationError);
                return reply(boom.badRequest(JSON.stringify(validationError.details)));
            } else {
                processStatistics(response.data.rates, request.query)
            }

        }, (errorMessage) => {

            console.error(errorMessage);
            return reply(boom.badImplementation(JSON.stringify(errorMessage)));

        })

    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
