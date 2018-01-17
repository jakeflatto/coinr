const getCoins = require('./getTopCoins');
const getMarkets = require('./getMarkets');
const fs = require('fs-extra');

async function filterMarkets(coinLimit) {
	let coins = await getCoins.getCoinMarketCap();
	if(coinLimit)
		coins = coins.slice(0, coinLimit);
	coins = coins.map(coin => coin.symbol);
	let markets = (await getMarkets()).filter(market => {
		return coins.includes(market.fsym);
	}).map(market => {
		delete market.volume_USD;
		delete market.rate;
		return market;
	});
	// LiveCoinWatch doesn't have all Binance USDT markets
	let testUSDT = markets.filter(market => market.exchange === 'Binance' && market.tsym === 'USDT');
	testUSDT = testUSDT.map(market => market.fsym);
	!testUSDT.includes('LTC') ? markets.push({ exchange: 'Binance', tsym: 'USDT', fsym: 'LTC' }) : null;
	!testUSDT.includes('BCH') ? markets.push({ exchange: 'Binance', tsym: 'USDT', fsym: 'BCH' }) : null;
	!testUSDT.includes('NEO') ? markets.push({ exchange: 'Binance', tsym: 'USDT', fsym: 'NEO' }) : null;
	// Handle edge cases
	markets = addCCCAGG(markets).filter(market => {
		return !(
			(market.tsym === 'USDT' && !market.exchange.match(/(CCCAGG)|(Okex)|(Binance)/i)) ||
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
	// Sort based on Exchange name
	jsonContents = jsonContents.sort((a, b) => a.exchange.toLowerCase() > b.exchange.toLowerCase() ? 1 : -1);
	await fs.writeFile(filePath, JSON.stringify(jsonContents));
	console.log('Updating file...');
	return jsonContents.length;
}

updateFile().then(rowCount => {
	if(rowCount)
		console.log(`Successfully wrote file. Total count is ${rowCount}.`);
});