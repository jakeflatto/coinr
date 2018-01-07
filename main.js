const fillHistory = require('./fillHistory');

// Settings
const fsymsUSD = [ 'BTC', 'ETH', 'LTC' ]; // For USD loop
const fsyms = [ 'ADA', 'ARK', 'BCH', 'BTG', 'DASH', 'EOS', 'IOTA', 'LSK', 'LTC', 'NEO', 'QTUM', 'STRAT', 'SUB', 'TRX', 'XLM', 'XMR', 'XRP', 'XVG', 'ZEC' ];
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

// Recursively run through every combination
function recursivelyRun(index) {
	return new Promise((resolve, reject) => {
		let combo = combinations[index];
		if(!combo)
			resolve(true);
		else {
			fillHistory(combo.fsym, combo.tsym, combo.exchange).then(nextCombo => {
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
recursivelyRun(77).then(finalRes => {
	console.log('COMPLETELY FINISHED!!');
	process.exit();
}).catch(err => {
	console.error(err);
	process.exit();
});
// Now we're here


