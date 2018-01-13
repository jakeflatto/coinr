const scrapePage = require('./scrapePage');

async function getLiveCoinWatch() {
	let table = await scrapePage('https://www.livecoinwatch.com/');

	return table.map(record => {
		return {
			symbol: record.Coin,
			name: record['14'],
			market_cap: parseFloat(record['Market Cap']),
			price: parseFloat(record.Price),
			volume_24h: parseFloat(record['Volume (24h)']),
			circulating_supply: parseFloat(record.Circulating),
			max_supply: parseFloat(record['Max Supply']),
			change_1h: parseFloat(record['1h']),
			change_24h: parseFloat(record['24h']),
			change_7d: parseFloat(record['7d']),
			change_30d: parseFloat(record['30d'])
		};
	});
};

async function getCoinMarketCap() {
	let table = await scrapePage('https://www.coinmarketcap.com/');

	return table.map(record => {
		let symbol = record.Name.trim().split(/\s+/g)[0];
		symbol === 'MIOTA' ? symbol = 'IOT' : null;
		return {
			symbol,
			name: record.Name.trim().split(/\s+/g)[1],
			market_cap: parseFloat(record['Market Cap'].replace(/\D/g, '')),
			price: parseFloat(record.Price.replace(/\D/g, '')),
			volume_24h: parseFloat(record['Volume (24h)'].replace(/\D/g, '')),
			circulating_supply: parseFloat(record['Circulating Supply'].replace(/\D/g, '')),
			change_24h: parseFloat(record['Change (24h)'])
		};
	});
};


module.exports = {
	getLiveCoinWatch,
	getCoinMarketCap
};