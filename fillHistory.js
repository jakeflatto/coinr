const CryptoAPI = require('cryptocompare');
global.fetch = require('node-fetch');
const pg = require('pg');

const limit = 2000;
const decrementValue = 3600 * 2001 * 1000;

let params = {
	TableName : 'price_histories_hourly',
	Item: {}
};
let count = 0;

const timer = function(currentFSym, currentTSym, currentExchange) {
	let currentTimestamp = new Date('Mon, 01 Jan 2018 00:00:00 GMT').getTime();
	let iterationsCount = 0;
	return new Promise((resolve, reject) => {
		let timer = setInterval(() => {
			apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange).then(dataList => {
				iterationsCount++;
				currentTimestamp -= decrementValue;
				// Log iteration info
				if(dataList.length) {
					let info = dataList.slice();
					console.log(dataList.length);
					console.log(`${new Date(info[info.length-1].hour_marker).toUTCString()} - ${new Date(info[0].hour_marker).toUTCString()}`);
				}
				
				// Write to Database
				new Promise((finishedDynamo, dynamoFail) => {
					if(!dataList.length)
						finishedDynamo(true);
					dataList.forEach((item, index) => {
						params.Item = item;
						DynamoDB.put(params, (err, data) => {
							if(err) {
								console.log(err);
								dynamoFail(err);
							} else if(dataList.length < 2001 && index >= dataList.length-1) {
								finishedDynamo(true);
							}
						});
					});
				}).then(dynamoRes => {
					// Finished whole loop writing to database
					clearInterval(timer);
					console.log(`FINISHED at toTs=${currentTimestamp/1000}`);
					resolve(dataList.length+2001*(iterationsCount-1));
				}).catch(err => {
					console.log(err);
					reject(err);
				});
			}).catch(err => {
				console.error('FAILED API Call');
				reject(err);
			});
		}, 5000);
	});
};
module.exports = timer;

function apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange) {
	return new Promise((resolve, reject) => {
			let formatData;
			resolve(formatData);
		}).catch(err => {
			reject(err);
		});
	});
};

function submitPostgres(data) {
	let formattedValues = data.map(obj => {
		return {
			time: obj.time,
			exchange: currentExchange,
			traded_with: currentTSym,
			traded_for: currentFSym,
			open: obj.open,
			high: obj.high,
			low: obj.low,
			close: obj.close,
			volume_traded_with: obj.volumeto,
			volume_traded_for: obj.volumefrom
		};
	}).filter(obj => obj.high).map(obj => formatValue(obj));
	
	let query = formatQuery(formattedValues);
	
	client.query(query, (err, res) => {
		if(err)
			console.log('FUCK! SHIT!');
		else {
			// TODO probably other shit
			console.log('Yeee boyy');
		}
	});
};

function formatQuery(values) {
	return `INSERT INTO price_histories_hourly VALUES ${values.join(',')};`;
}

function formatValue(obj) {
	// console.log(obj);
	return `(TIMESTAMP '${new Date(obj.time*1000).toISOString().replace('T',' ').replace('Z','')}',
	'${obj.exchange}',
	'${obj.traded_with}',
	'${obj.traded_for}',
	${obj.open}::numeric,
	${obj.high},
	${obj.low},
	${obj.close},
	${obj.volume_traded_with},
	${obj.volume_traded_for})`.replace(/\s+/g, ' ');
};