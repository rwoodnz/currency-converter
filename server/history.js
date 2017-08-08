'use strict';

const fs = require('fs');
const statisticsFile = './statistics.txt';

function ensureStatisticsFileExists() {

    fs.stat(statisticsFile, function (err, stat) {
        if (err !== null) {
            let initialStatistics = {
                totalAmountConverted: 0,
                totalNumberOfConversions: 0,
                currencyCounts: {}
            }
            fs.writeFile(statisticsFile, JSON.stringify(initialStatistics));
        }
    });

}

function readStatistics (done) {

    fs.readFile(statisticsFile, 'utf8', function (err, content) {
        if (err) {
            return done(err);
        }
        done(null, JSON.parse(content))
    });

}

function writeStatistics(updatedStatistics, done) {

    fs.writeFile(statisticsFile, JSON.stringify(updatedStatistics), function (err) {
        if (err) {
            return done(err);
        }
        done(null, updatedStatistics);
    });

}

function calculateUpdate (statistics, to, USDResult) {

    statistics.totalAmountConverted += USDResult;
    statistics.totalNumberOfConversions += 1;

    if (statistics.currencyCounts.hasOwnProperty(to)) {
        statistics.currencyCounts[to] += 1;
    } else {
        // Add to currency list
        statistics.currencyCounts[to] = 1;
    }

    return statistics;
}

module.exports = { 
    ensureStatisticsFileExists: ensureStatisticsFileExists, 
    readStatistics: readStatistics,
    writeStatistics: writeStatistics,
    calculateUpdate: calculateUpdate
};

