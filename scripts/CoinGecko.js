'use strict';

let priceData;
let currencies;

let App;

const init = (_App) => {
  App = _App;
};

const requestPriceData = () => {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=elastos&vs_currencies='+App.getCurrentCurrency();
  //console.log(url);
  App.getJson(url, requestPriceDataReadyCallback, requestPriceDataErrorCallback);
};

const requestPriceDataReadyCallback = (response) => {
  //console.log(JSON.stringify(response));
  priceData = response;
  App.renderApp();
}

const requestPriceDataErrorCallback = (response) => {
  console.log("Unable to request data from CoinGecko", response.status);
}

const requestCurrencies = () => {
  const url = 'https://api.coingecko.com/api/v3/exchange_rates';
  App.getJson(url, requestCurrenciesReadyCallback, requestCurrenciesErrorCallback);
};

const requestCurrenciesReadyCallback = (response) => {
  //console.log("Loaded requestCurrenciesReadyCallback");
  currencies = response;
  App.parseFiatList();  
}

const requestCurrenciesErrorCallback = (response) => {
  console.log("Unable to request data from CoinGecko", response.status);
}

const getPriceData = () => {
  return priceData;
};

const getCurrencies = () => {
  return currencies;
}

exports.init = init;
exports.requestPriceData = requestPriceData;
exports.getPriceData = getPriceData;
exports.requestCurrencies = requestCurrencies;
exports.getCurrencies = getCurrencies;
