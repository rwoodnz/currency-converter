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
            fs.writeFileSync(statisticsFile, JSON.stringify(initialStatistics));
        }
    });

}

const readStatistics = done => {
    let result = fs.readFileSync(statisticsFile, 'utf8');
    return JSON.parse(result)
}

const writeStatistics = (updatedStatistics) => {
        fs.writeFileSync(statisticsFile, JSON.stringify(updatedStatistics))
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

