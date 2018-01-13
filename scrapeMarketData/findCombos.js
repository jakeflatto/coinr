const getCoins = require('./getTopCoins');
const getMarkets = require('./getMarkets');
const fs = require('fs-extra');

async function filterMarkets() {
	let coins = await getCoins.getCoinMarketCap();
	coins = coins.map(coin => coin.symbol);
	let markets = await getMarkets();

	return markets.filter(market => {
		return coins.includes(market.fsym);
	}).map(market => {
		delete market.volume_USD;
		delete market.rate;
		return market;
	});
}

async function createFile() {
	let markets = await filterMarkets();
	let filePath = './combos.json';
	await fs.writeFile(filePath, JSON.stringify(markets));
	console.log('Writing combos.json file...');
}

function addCCCAGG(combos) {
	let unique = combos.slice();
	// TODO finish this
}

async function updateFile() {
	let markets = await filterMarkets();
	let filePath = './combos.json';
	let jsonContents;

	try {
		await fs.access(filePath);
		jsonContents = JSON.parse(await fs.readFile(filePath));
		// console.log(addCCCAGG(jsonContents));
		console.log('Found JSON!');
	} catch(err) {
		console.log(err);
		return;
	}
	// Add diff to JSON
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
}

updateFile();