const scrapePage = require('./scrapePage');
const getCoins = require('./getTopCoins');
const acceptedExchanges = [
	'Bithumb',
	'Binance',
	'Bitfinex',
	'Bittrex',
	'Huobi',
	'Poloniex',
	'Okex',
	'Kraken',
	'GDAX',
	'HitBTC',
	'Coinone',
	'Korbit',
	'Bitstamp',
	'Gemini'
];

async function getMarkets() {
	let table = await scrapePage('https://www.livecoinwatch.com/markets');

	return table.map(record => {
		let fsym = record.Market.split('/')[0];
		fsym === 'MIOTA' ? fsym = 'IOT' : null;
		return {
			exchange: record.Exchange,
			fsym,
			tsym: record.Market.split('/')[1],
			rate: parseFloat(record.Rate),
			volume_USD: parseFloat(record.Volume.replace(/\D+/g, ''))
		};
	}).filter(record => {
		return acceptedExchanges.includes(record.exchange);
	});
}

module.exports = getMarkets;

