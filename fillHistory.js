const CryptoAPI = require('cryptocompare');
global.fetch = require('node-fetch');
const AWS = require('aws-sdk');
const DynamoDB = new AWS.DynamoDB.DocumentClient({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: 'us-west-2'
});

const limit = 2000;
let currentTimestamp = new Date('1/1/18').getTime();
const decrementValue = 3600 * 2001 * 1000;

let params = {
	TableName : 'price_histories_hourly',
	Item: {}
};
let count = 0;

const timer = function(currentFSym, currentTSym, currentExchange) {
	return new Promise((resolve, reject) => {
		let timer = setInterval(() => {
			apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange).then(dataList => {
				currentTimestamp -= decrementValue;
				console.log('Made API Call');
				
				// When done
				if(!dataList.length) {
					clearInterval(timer);
					resolve(true);
					console.log(`FINISHED combo ${currentExchange}-${currentTSym}-${currentFSym}`);
				} else {
					let info = dataList.slice();
					console.log(`${new Date(info.pop().hour_marker).toUTCString()} - ${new Date(info.shift().hour_marker).toUTCString()}`);
					
					// Write to Database
					dataList.forEach(item => {
						params.Item = item;
						DynamoDB.put(params, (err, data) => {
							if(err) {
								console.error(`Dynamo Fail`);
								reject(err);
							}
						});
					});
				}
			}).catch(err => {
				console.error('FAILED API Call');
				reject(err);
			});
		}, 10000);
	});
};
module.exports = timer;

function apiIteration(currentFSym, currentTSym, currentTimestamp, currentExchange) {
	return new Promise((resolve, reject) => {
		CryptoAPI.histoHour(currentFSym, currentTSym, { limit, timestamp: new Date(currentTimestamp), exchange: currentExchange })
		.then(data => {
			if(!data.length) {
				resolve(`ENDED HISTORY ${currentTimestamp}-For:${currentFSym}-To:${currentTSym}`);
				return;
			}
			let formatData = data.map(obj => {
				return {
					hour_marker: obj.time * 1000,
					combo: `${currentExchange}-${currentTSym}-${currentFSym}`,
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
			});
			resolve(formatData);
		}).catch(err => {
			reject(err);
		});
	});
};