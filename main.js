const CryptoAPI = require('cryptocompare');
global.fetch = require('node-fetch');
const AWS = require('aws-sdk');
const fs = require('fs');

// Settings
const fsymsUSD = [ 'BTC', 'ETH', 'LTC' ];
const fsyms = [ 'ADA', 'ARK', 'BCH', 'BTG', 'DASH', 'EOS', 'IOTA', 'LSK', 'LTC', 'NEO', 'QTUM', 'STRAT', 'SUB', 'TRX', 'XLM', 'XMR', 'XRP', 'XVG', 'ZEC' ];
const tsyms = [ 'BTC', 'ETH', 'USD' ];
const exchanges = [ 'Binance', 'CCCAGG' ];
const limit = 2000;
const startTimestamp = new Date('1/1/18').getTime() / 1000;



CryptoAPI.hisToHour().then(data => {
	let jsonContent = JSON.stringify(data);

	fs.writeFile('test.json', jsonContent, (err) => {
		console.log('Saved!');
	});
});