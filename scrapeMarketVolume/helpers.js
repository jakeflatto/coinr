const waybackAPI = require('wayback-machine');

function getTimeline(url) {
	return new Promise((resolve, reject) => {
		waybackAPI.getTimeline(url, (err, timeline) => {
			if(!err)
				resolve(timeline.mementos);
			reject(err);
		});
	});
}

function formatTable(table, date, coinList) {
	// Table changes over time, find the right column
	let keys = Object.keys(table[0]);
	let index = {
		name: keys.find(key => key.match(/name/i)),
		marketCap: keys.find(key => key.match(/market/i)),
		price: keys.find(key => key.match(/price/i)),
		supply: keys.find(key => key.match(/supply/i)),
		volume: keys.find(key => key.match(/volume/i)),
		change: keys.find(key => key.match(/change/i))
	};
	
	// Removes unwanted coins
	return table.filter(item => {
		let symbol = item[index.supply] ?
			item[index.supply].split(/\s+/g)[1] : null;
		return symbol && (coinList.includes(symbol) || symbol.match(/IOTA/gi));
	}).map(item => {
		// Format each row
		let splitName = item[index.name].split(/\s+/);
		return [
			date,
			item[index.supply].split(/\s+/g)[1], // Symbol
			splitName.length > 1 ? splitName[1] : splitName[0], // Name
			Number.isNaN(parseFloat(item[index.price].replace(/\$/g, ''))) ?
				null : parseFloat(item[index.price].replace(/\$/g, '')), // Price in USD
			Number.isNaN(parseInt(item[index.marketCap].replace(/\D/g, ''))) ?
				null : parseInt(item[index.marketCap].replace(/\D/g, '')), // Market Cap in USD
			index.volume ?
				Number.isNaN(parseInt(item[index.volume].replace(/\D/g, ''))) ?
					null : parseInt(item[index.volume].replace(/\D/g, '')) : null, // 24h Volume in USD
			Number.isNaN(parseInt(item[index.supply].replace(/\D/g, ''))) ?
				null : parseInt(item[index.supply].replace(/\D/g, '')), // Circulating Supply
			Number.isNaN(parseFloat(item[index.change].replace(/\+|\s+|%/g, ''))) ?
				null : parseFloat(item[index.change].replace(/\+|\s+|%/g, '')) // % Change in 24h
		];
	});
}

module.exports = { formatTable, getTimeline };