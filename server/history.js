'use strict';

const fs = require('fs');
const statisticsFile = './statistics.txt';

const ensureStatisticsFileExists = () => {

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

const readStatistics = done => {

    fs.readFile(statisticsFile, 'utf8', function (err, content) {
        if (err) {
            return done(err);
        }
        done(null, JSON.parse(content))
    });

}

const writeStatistics = (updatedStatistics, done) => {

    fs.writeFile(statisticsFile, JSON.stringify(updatedStatistics), function (err) {
        if (err) {
            return done(err);
        }
        done(null, updatedStatistics);
    });

}

const calculateUpdate = (statistics, to, USDResult) => {

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
    ensureStatisticsFileExists, 
    readStatistics,
    writeStatistics,
    calculateUpdate
};

