const fillHistory = require('./fillHistory');

// Settings
const fsymsTether = [ 'BTC', 'ETH', 'LTC', 'BCH', 'NEO' ];
const fsymsUSD = [ 'BTC', 'ETH', 'LTC' ]; // For USD loop
const fsyms = [ 'ADA', 'ARK', 'BCH', 'BTG', 'DASH', 'EOS', 'IOT', 'LSK', 'LTC', 'NEO', 'QTUM', 'STRAT', 'SUB', 'TRX', 'XLM', 'XMR', 'XRP', 'XVG', 'ZEC' ];
const tsyms = [ 'BTC', 'ETH' ];
const exchanges = [ 'Binance', 'CCCAGG' ];

// Fills out all combinations
let combinations = [];
exchanges.forEach(currentExchange => {
	tsyms.forEach(currentTSym => {
		fsyms.forEach(currentFSym => {
			combinations.push({ fsym: currentFSym, tsym: currentTSym, exchange: currentExchange });
		});
	});
});
fsymsUSD.forEach(currentFSym => {
	const currentTSym = 'USD';
	const currentExchange = 'CCCAGG';
	combinations.push({ fsym: currentFSym, tsym: currentTSym, exchange: currentExchange });
});
exchanges.forEach(currentExchange => {
	const currentTSym = 'USDT';
	fsymsTether.forEach(currentFSym => {
		combinations.push({ fsym: currentFSym, tsym: currentTSym, exchange: currentExchange });
	});
});

let totalRows = 0;

// Recursively run through every combination
function recursivelyRun(index) {
	return new Promise((resolve, reject) => {
		let combo = combinations[index];
		if(!combo)
			resolve(true);
		else {
			console.log(`${index+1}/${combinations.length}`);
			console.log(`${combo.exchange}-${combo.tsym}-${combo.fsym}`);
			fillHistory(combo.fsym, combo.tsym, combo.exchange).then( rowCount => {
				totalRows += rowCount;
				console.log(`Rows Added: ${rowCount}`);
				console.log(`Running Total: ${totalRows}`);
				console.log('------------------');
				recursivelyRun(index+1).then(() => {
					resolve(true);
				});
			}).catch(err => {
				reject(err);
			});
		}
	});
}

// Started from the bottom
recursivelyRun(0).then(finalRes => {
	console.log('COMPLETELY FINISHED!!');
	console.log(`Total Rows: ${totalRows}`);
	process.exit();
}).catch(err => {
	console.error(err);
	process.exit();
});
// Now we're here


