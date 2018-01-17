const CryptoAPI = require('cryptocompare');
global.fetch = require('node-fetch');
const submitPostgres = require('../submitPostgres/submitPostgres');

const limit = 2000;
const decrementValue = 3600 * 2001 * 1000;
const startTimestamp = new Date('Mon, 01 Jan 2018 00:00:00 GMT').getTime();

async function fillHistory(currentFSym, currentTSym, currentExchange) {
	return await recursivelyCall(currentFSym, currentTSym, startTimestamp, currentExchange, 0);
};

module.exports = fillHistory;

function recursivelyCall(currentFSym, currentTSym, currentTimestamp, currentExchange, rowCount) {
	return new Promise((resolve, reject) => {
		apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange).then(dataList => {
			rowCount += dataList.length;
			currentTimestamp -= decrementValue;
			
			// When no more history, finish up
			if(!dataList.length) {
				console.log(`FINISHED at toTs=${currentTimestamp/1000}`);
				resolve(rowCount);
				return;
			}
			
			// Write to Database
			submitPostgres('test2', dataList).then(() => {
				let info = dataList.slice();
				console.log(dataList.length);
				console.log(`${new Date(info[info.length-1].hour_marker).toUTCString()} - ${new Date(info[0].hour_marker).toUTCString()}`);
				recursivelyCall(currentFSym, currentTSym, currentTimestamp, currentExchange, rowCount).then(nextCount => {
					resolve(nextCount);
				}).catch(err => {
					console.log('Recursive API call failed.');
					reject(err);
				});
			}).catch(err => {
				console.log(`Postgres failed at Iteration ${Math.floor(rowCount/2001)}`);
				reject(err);
			});
		}).catch(err => {
			console.error(`FAILED API Call at Iteration ${Math.floor(rowCount/2001)}`);
			reject(err);
		});
	});
}

async function apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange) {
	let data = await CryptoAPI.histoHour(currentFSym, currentTSym, { limit, timestamp: new Date(currentTimestamp), exchange: currentExchange });
	if(!data.length)
		return [];
	let formatData = data.map(obj => {
		return {
			hour_marker: obj.time * 1000,
			traded_with: currentTSym,
			traded_for: currentFSym,
			exchange: currentExchange,
			open: obj.open,
			high: obj.high,
			low: obj.low,
			close: obj.close,
			volume_traded_with: obj.volumeto,
			volume_traded_for: obj.volumefrom
		};
	}).filter(obj => !!obj.high);
	return formatData;
};