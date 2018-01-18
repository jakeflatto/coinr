const CryptoAPI = require('cryptocompare');
global.fetch = require('node-fetch');
const submitPostgres = require('../submitPostgres/submitPostgres');
const limit = 2000;
const decrementValue = 3600 * 2001 * 1000;

// Each API call iteration
async function apiIteration(currentFSym, currentTSym, currentTimestamp, endTimestamp, currentExchange) {
	let data = await CryptoAPI.histoHour(currentFSym, currentTSym, { limit, timestamp: new Date(currentTimestamp), exchange: currentExchange });
	data = data.filter(obj => !!obj.high && obj.time > endTimestamp / 1000);
	if(!data.length)
		return [];
	
	console.log(`Rows: ${data.length}`);
	console.log(`${new Date(data[data.length-1].time * 1000).toUTCString()} - ${new Date(data[0].time * 1000).toUTCString()}`);
	let formatData = data.map(obj => {
		return [
			new Date(obj.time * 1000),
			currentTSym,
			currentFSym,
			currentExchange,
			obj.open,
			obj.high,
			obj.low,
			obj.close,
			obj.volumeto,
			obj.volumefrom
		];
	});
	return formatData;
};

// Entire history for current combo
async function fillHistory(currentFSym, currentTSym, currentTimestamp, endTimestamp, currentExchange, rowCount, client, table) {
	let rowsList = await apiIteration(currentFSym, currentTSym, currentTimestamp, endTimestamp, currentExchange);
	rowCount += rowsList.length;
	currentTimestamp -= decrementValue;
	
	// When no more history, finish up
	if(!rowsList.length) {
		console.log(`FINISHED at toTs=${currentTimestamp/1000}`);
		return rowCount;
	}
	
	// Write to Database
	await submitPostgres(client, table, rowsList);
	let nextCount = await fillHistory(currentFSym, currentTSym, currentTimestamp, endTimestamp, currentExchange, rowCount, client, table);
	return nextCount;
}

module.exports = fillHistory;