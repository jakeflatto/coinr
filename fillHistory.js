const CryptoAPI = require('cryptocompare');
global.fetch = require('node-fetch');
const pg = require('pg');
const client = new pg.Client({
	user: 'postgres',
	host: 'localhost',
	database: 'coinr',
	password: process.env.POSTGRES,
	port: 5432
});
client.connect();

const limit = 2000;
const decrementValue = 3600 * 2001 * 1000;

module.exports = function(currentFSym, currentTSym, currentExchange) {
	let currentTimestamp = new Date('Mon, 01 Jan 2018 00:00:00 GMT').getTime();
	let rowCount = 0;
	return new Promise((resolve, reject) => {
		let timer = setInterval(() => {
			apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange).then(dataList => {
				rowCount += dataList.length;
				currentTimestamp -= decrementValue;
				
				// When no more history, finish up
				if(!dataList.length) {
					clearInterval(timer);
					console.log(`FINISHED at toTs=${currentTimestamp/1000}`);
					resolve(rowCount);
					return;
				}
				
				// Write to Database
				submitPostgres(dataList).then(() => {
					let info = dataList.slice();
					console.log(dataList.length);
					console.log(`${new Date(info[info.length-1].hour_marker).toUTCString()} - ${new Date(info[0].hour_marker).toUTCString()}`);
				}).catch(err => {
					console.log(`Postgres failed at Iteration ${Math.floor(rowCount/2001)}`);
					reject(err);
				});
			}).catch(err => {
				console.error(`FAILED API Call at Iteration ${Math.floor(rowCount/2001)}`);
				reject(err);
			});
		}, 500);
	});
};

function apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange) {
	return new Promise((resolve, reject) => {
		CryptoAPI.histoHour(currentFSym, currentTSym, { limit, timestamp: new Date(currentTimestamp), exchange: currentExchange })
			.then(data => {
				if(!data.length) {
					resolve([]);
					return;
				}
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
				resolve(formatData);
			}).catch(err => {
			reject(err);
		});
	});
	
};

function submitPostgres(data) {
	let formattedValues = data.map(obj => formatValue(obj));
	let query = formatQuery(formattedValues);
	
	return new Promise((resolve,reject) => {
		client.query(query, (err, res) => {
			if(err)
				reject(err);
			else
				resolve(res);
		});
	});
};

function formatQuery(values) {
	return `INSERT INTO price_histories_hourly VALUES ${values.join(',')};`;
}

function formatValue(obj) {
	// console.log(obj);
	return `(TIMESTAMP '${new Date(obj.hour_marker).toISOString().replace('T',' ').replace('Z','')}',
	'${obj.traded_with}',
	'${obj.traded_for}',
	'${obj.exchange}',
	${obj.open},
	${obj.high},
	${obj.low},
	${obj.close},
	${obj.volume_traded_with},
	${obj.volume_traded_for})`.replace(/\s+/g, ' ');
};