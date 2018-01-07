const CryptoAPI = require('cryptocompare');
global.fetch = require('node-fetch');
const pg = require('pg');
const client = new pg.Client({
	user: 'coinr_admin',
	host: 'coinr.ctcg3jpd2obd.us-west-2.rds.amazonaws.com',
	database: 'coinr',
	password: 'uEB%a*9LTjY1eG4J',
	port: 5432
});
client.connect();


// Settings
const fsymsUSD = [ 'BTC', 'ETH', 'LTC' ]; // For USD loop
const fsyms = [ 'ADA', 'ARK', 'BCH', 'BTG', 'DASH', 'EOS', 'IOTA', 'LSK', 'LTC', 'NEO', 'QTUM', 'STRAT', 'SUB', 'TRX', 'XLM', 'XMR', 'XRP', 'XVG', 'ZEC' ];
const tsyms = [ 'BTC', 'ETH' ];
const exchanges = [ 'Binance', 'CCCAGG' ];
const limit = 2000;
const startTimestamp = new Date('1/1/18');
let nextTimestamp = startTimestamp - (3600*2001);

let currentExchange = exchanges[0];
let currentFSym = fsyms[0];
let currentTSym = tsyms[0];
let currentTimestamp = startTimestamp;


CryptoAPI.histoHour(currentFSym, currentTSym, { limit, timestamp: currentTimestamp, exchange: currentExchange })
.then(data => {
	let formattedValues = data.map(obj => {
		let formatObj = {
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
		return formatObj;
	})
	.filter(obj => obj.high)
	.map(obj => {
		return formatValue(obj);
	});
	let query = formatQuery(formattedValues);

	client.query(query, (err, res) => {
		if(err)
			console.log('FUCK! SHIT!');
		else {
			// TODO probably other shit
			console.log('Yeee boyy');
		}
	});
});

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