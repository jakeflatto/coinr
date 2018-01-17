const getCoins = require('./getTopCoins');
const getMarkets = require('./getMarkets');
const fs = require('fs-extra');

async function filterMarkets(coinLimit) {
	let coins = await getCoins.getCoinMarketCap();
	if(coinLimit)
		coins = coins.slice(0, coinLimit);
	coins = coins.map(coin => coin.symbol);
	let markets = await getMarkets();
	markets = markets.filter(market => {
		return coins.includes(market.fsym);
	}).map(market => {
		delete market.volume_USD;
		delete market.rate;
		return market;
	});
	// Strip out edge cases
	markets = addCCCAGG(markets).filter(market => {
		return !(
			(market.tsym === 'USDT' && market.exchange !== 'CCCAGG') ||
			(market.fsym === 'QTUM' && market.exchange === 'Bithumb') ||
			(market.fsym === 'EOS' && market.exchange === 'Bithumb') ||
			(market.fsym === 'XRP' && market.exchange === 'Korbit') ||
			(market.fsym === 'ETHOS' && market.exchange === 'Binance')
		);
	});
	
	return markets;
}

function addCCCAGG(combos) {
	// Find unique pairs
	let unique = combos.slice();
	combos.forEach(combo => {
		let eliminateFunc = (check) => {
			return check.fsym === combo.fsym && check.tsym === combo.tsym;
		};
		let countDupes = unique.filter(eliminateFunc).length || 0;
		if(countDupes > 1) {
			let removeIndex = unique.findIndex(eliminateFunc);
			unique.splice(removeIndex, 1);
		}
	});
	unique.forEach(pair => {
		combos.push({
			exchange: 'CCCAGG',
			fsym: pair.fsym,
			tsym: pair.tsym
		});
	});
	return combos;
}

async function createFile() {
	let markets = await filterMarkets();
	let filePath = './combos.json';
	await fs.writeFile(filePath, JSON.stringify(markets));
	console.log('Writing combos.json file...');
}

async function updateFile() {
	let markets = await filterMarkets(); // Adds CCCAGG too
	let filePath = './combos.json';
	let jsonContents;

	try {
		await fs.access(filePath);
		jsonContents = JSON.parse(await fs.readFile(filePath));
		console.log('Found JSON!');
	} catch(err) {
		console.log('No JSON found.');
		await createFile();
		return markets.length;
	}
	// JSON already exists, only add if in top 80 coins
	markets = await filterMarkets(50);
	// Add net changes to JSON
	let deltaMarkets = markets.filter(market => {
		return !jsonContents.some(compare => compare.exchange === market.exchange && compare.fsym === market.fsym && compare.tsym === market.tsym);
	});
	if(!deltaMarkets.length) {
		console.log('Combos.json is up to date!');
		return;
	}
	console.log(`Adding ${deltaMarkets.length} new combination${deltaMarkets.length > 1 ? 's' : ''}.`);
	deltaMarkets.forEach(newMarket => jsonContents.push(newMarket));
	await fs.writeFile(filePath, JSON.stringify(jsonContents));
	console.log('Updating file...');
	return jsonContents.length;
}

updateFile().then(rowCount => {
	if(rowCount)
		console.log(`Successfully wrote file. Total count is ${rowCount}.`);
});