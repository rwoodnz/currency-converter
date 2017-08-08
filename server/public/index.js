$(document).ready(function() {

    const currenciesURL = 'http://localhost:3000/currencies';
    const statisticsURL = 'http://localhost:3000/statistics';
    const conversionURL = 'http://localhost:3000/convert';

    const failCurrenciesMessage = 'Sorry, system failure. Could not load currencies';
    const failStatisticsMessage = 'Sorry, system failure. Could not load statistics';
    const failConversionMessage = 'Sorry, system failure. Could not convert';

    var options = [];

    $.getJSON(currenciesURL, loadCurrencies)
        .fail(() => setError(failCurrenciesMessage));

    $.getJSON(statisticsURL, presentStatistics)
        .fail(() => setError(failStatisticsMessage));

    function loadCurrencies(data) {

        Object.keys(data).forEach(
            (symbol) => options.push(`<option value=${symbol}>${symbol} - ${data[symbol]}</option>`)
        );
        conversionSetup()
    }

    function conversionSetup() {
        $('#amount').on('change', convert)

        $('.currency')
            .append(options.join(''))
            .selectmenu();

        $('#currency-from')
            .selectmenu()
            .on('selectmenuchange', convert)
            .selectmenu('menuWidget')
            .addClass('overflow');

        $('#currency-to')
            .selectmenu()
            .on('selectmenuchange', convert)
            .selectmenu('menuWidget')
            .addClass('overflow');
    }

    function convert() {
        clearError();
        let amount = $('#amount').val();
        let from = $('#currency-from').val();
        let to = $('#currency-to').val();

        if (amount) {
            let query = `?amount=${amount}&from=${from}&to=${to}`;
            $.getJSON(conversionURL+query, presentAnswer)
                .fail(() => setError(failConversionMessage));
        } else {
            clearAnswer();
        }
    }

    function presentFail() {
        $('#result').text('')
    }

    function clearAnswer() {
        $('#result').text('');
    }

    function presentAnswer(data) {
        $('#result').text(data.result);
        presentStatistics(data);
    }

    function presentStatistics(data) {
        let counts = data.currencyCounts;
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

    function setError(message) {
        $('#error-message').append(message+"</br>")
    }

    function clearError() {
        $('#error-message').text('');
    }

});