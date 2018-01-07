const CryptoAPI = require('cryptocompare');
global.fetch = require('node-fetch');
// const pg = require('pg');
// const client = new pg.Client({
// 	user: 'coinr_admin',
// 	host: 'coinr.ctcg3jpd2obd.us-west-2.rds.amazonaws.com',
// 	database: 'coinr',
// 	password: 'uEB%a*9LTjY1eG4J',
// 	port: 5432
// });
// client.connect();

const limit = 2000;
const startTimestamp = new Date('1/1/18');
const decrementValue = 3600 * 2001;
const test = { fsym: 'ADA', tsym: 'BTC', exchange: 'CCCAGG' };

const timer = function(currentFSym, currentTSym, currentExchange) {
	return new Promise((resolve, reject) => {
		console.log(`${currentExchange}-${currentTSym}-${currentFSym}`);
		let timer = setInterval(() => {
			console.log('Made API Call');
		}, 1000);
		setTimeout(() => {
			clearInterval(timer);
			resolve(true);
			console.log(`FINISHED`);
		}, 5000);
	});
};

module.exports = timer;

// function apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange) {
// 	return new Promise((resolve, reject) => {
// 		CryptoAPI.histoHour(currentFSym, currentTSym, { limit, timestamp: currentTimestamp, exchange: currentExchange })
// 		.then(data => {
// 			if(!data.length) {
// 				resolve(`ENDED HISTORY ${currentTimestamp}-For:${currentFSym}-To:${currentTSym}`);
// 				return;
// 			}
// 			let formattedValues = formatData(data).map(obj => formatValue(obj));
// 			let query = formatQuery(formattedValues);
// 			// Postgres Query
// 			client.query(query, (err, res) => {
// 				if(err)
// 					reject(`ERROR at ${currentTimestamp}-For:${currentFSym}-To:${currentTSym}`);
// 				else {
// 					resolve(`Inserted ${currentTimestamp}-For:${currentFSym}-To:${currentTSym}`)
// 				}
// 			});
// 		}).catch(err => {
// 			reject(err);
// 		});
// 	});
// };
//
// // Helper Functions
// function formatData(data) {
// 	let formattedValues = data.map(obj => {
// 		return {
// 			time: obj.time,
// 			exchange: currentExchange,
// 			traded_with: currentTSym,
// 			traded_for: currentFSym,
// 			open: obj.open,
// 			high: obj.high,
// 			low: obj.low,
// 			close: obj.close,
// 			volume_traded_with: obj.volumeto,
// 			volume_traded_for: obj.volumefrom
// 		};
// 	}).filter(obj => obj.high);
// 	return formattedValues;
// };
//
// function formatQuery(values) {
// 	console.log(values.length);
// 	return `INSERT INTO price_histories_hourly VALUES ${values.join(',')};`;
// }
//
// function formatValue(obj) {
// 	return `(TIMESTAMP '${new Date(obj.time*1000).toISOString().replace('T',' ').replace('Z','')}',
// 	'${obj.exchange}',
// 	'${obj.traded_with}',
// 	'${obj.traded_for}',
// 	${obj.open}::numeric,
// 	${obj.high},
// 	${obj.low},
// 	${obj.close},
// 	${obj.volume_traded_with},
// 	${obj.volume_traded_for})`.replace(/\s+/g, ' ');
// };