const converter = (() => {

    const failCurrenciesMessage = 'Sorry, system failure. Could not load currencies';
    const failConversionMessage = 'Sorry, system failure. Could not convert';

    const currenciesURL = 'http://localhost:3000/currencies';
    const conversionURL = 'http://localhost:3000/convert';

    const clearAnswer = () => $('#result').text('');

    const presentAnswer = data => {
        $('#result').text(data.result);
        statistics.presentStatistics(data);
    }

    const convert = () => {
        clearError();
        const amount = $('#amount').val();
        const from = $('#currency-from').val();
        const to = $('#currency-to').val();

        if (amount) {
            const query = `?amount=${amount}&from=${from}&to=${to}`;
            $.getJSON(conversionURL + query, presentAnswer)
                .fail(() => setError(failConversionMessage));
        } else {
            clearAnswer();
        }
    }

    const conversionSetup = (options) => {

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

    const loadCurrencies = data => {

        let options = [];

        Object.keys(data).forEach(
            (symbol) => options.push(`<option value=${symbol}>${symbol} - ${data[symbol]}</option>`)
        );

        conversionSetup(options)
    }

    const getCurrencies = (done) => $.getJSON(currenciesURL, done).fail(() => setError(failCurrenciesMessage));

    return {
        getCurrencies,
        loadCurrencies
    }

})();
