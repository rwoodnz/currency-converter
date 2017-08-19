const statistics = (() => {

    const statisticsURL = 'http://localhost:3000/statistics';

    const failStatisticsMessage = 'Sorry, system failure. Could not load statistics';

    const presentStatistics = data => {
        const counts = data.currencyCounts;
        let max = 0;
        let maxKey = []

        Object.keys(counts).forEach(function (key, index) {
            // When more than one leading destination currency
            if (counts[key] == max) {
                max = counts[key];
                maxKey.push(key);
            }
            // When only one leading destination currency
            if (counts[key] > max) {
                max = counts[key];
                maxKey = [key];
            }
        });

        $('#top-destination-total').text(maxKey);
        $('#usd-total').text(data.totalAmountConverted);
        $('#request-count').text(data.totalNumberOfConversions);
    }

    const getStatistics = () => $.getJSON(statisticsURL, presentStatistics).fail(() => setError(failStatisticsMessage));

    return {
        getStatistics,
        presentStatistics
    }

})();