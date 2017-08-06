'use strict';

const fs = require('fs');
const statisticsFile = './statistics.txt';

function ensureStatisticsFileExists() {

    fs.stat(statisticsFile, function (err, stat) {
        if (err !== null) {
            let initialStats = {
                totalAmountConverted: 0,
                totalNumberOfConversions: 0,
                currencyCounts: {}
            }
            fs.writeFile(statisticsFile, JSON.stringify(initialStats));
        }
    });

}

function updateStats (to, USDResult, done) {

    fs.readFile(statisticsFile, "utf8", function (err, content) {
        if (err) {
            return done(err);
        }
        let existingStats = JSON.parse(content);

        let update = calculateUpdate(existingStats, to, USDResult);

        fs.writeFile(statisticsFile, JSON.stringify(update), function (err) {
            if(err) {
                return done( err );
            }
            done(null, update);
        });
    })

}

function calculateUpdate (stats, to, USDResult) {

    stats.totalAmountConverted += USDResult;
    stats.totalNumberOfConversions += 1;

    if (stats.currencyCounts.hasOwnProperty(to)) {
        stats.currencyCounts[to] += 1;
    } else {
        // Add to currency list
        stats.currencyCounts[to] = 1;
    }

    return stats;

}

module.exports = { 
    ensureStatisticsFileExists: ensureStatisticsFileExists, 
    updateStats: updateStats,
    calculateUpdate: calculateUpdate
};

