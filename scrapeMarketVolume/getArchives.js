const waybackAPI = require('wayback-machine');
const scraper = require('../scrapeMarketData/scraper');
const fetch = require('node-fetch');
const $ = require('cheerio');
const fs = require('fs-extra');

function getTimeline(url) {
	return new Promise((resolve, reject) => {
		waybackAPI.getTimeline(url, (err, timeline) => {
			if(!err)
				resolve(timeline.mementos);
			reject(err);
		});
	});
}

function formatTable(table, date, coinList) {
	// Table changes over time, find the right column
	let keys = Object.keys(table[0]);
	let index = {
		name: keys.find(key => key.match(/name/i)),
		marketCap: keys.find(key => key.match(/market/i)),
		price: keys.find(key => key.match(/price/i)),
		supply: keys.find(key => key.match(/supply/i)),
		volume: keys.find(key => key.match(/volume/i)),
		change: keys.find(key => key.match(/change/i))
	};
	
	// Removes unwanted coins
	return table.filter(item => {
		let symbol = item[index.supply] ? item[index.supply].split(/\s+/g)[1] : null;
		return symbol && (coinList.includes(symbol) || symbol.match(/IOTA/gi));
	}).map(item => {
		// Format each row
		let splitName = item[index.name].split(/\s+/);
		return {
			date,
			symbol: item[index.supply].split(/\s+/g)[1],
			name: splitName.length > 1 ? splitName[1] : splitName[0],
			price_USD: Number.isNaN(parseFloat(item[index.price].replace(/\$/g, ''))) ? null : parseFloat(item[index.price].replace(/\$/g, '')),
			market_cap: Number.isNaN(parseInt(item[index.marketCap].replace(/\D/g, ''))) ? null : parseInt(item[index.marketCap].replace(/\D/g, '')),
			volume_24h_USD: index.volume ? Number.isNaN(parseInt(item[index.volume].replace(/\D/g, ''))) ? null : parseInt(item[index.volume].replace(/\D/g, '')) : null,
			circulating_supply: Number.isNaN(parseInt(item[index.supply].replace(/\D/g, ''))) ? null : parseInt(item[index.supply].replace(/\D/g, '')),
			change_24h: Number.isNaN(parseFloat(item[index.change].replace(/\+|\s+|%/g, ''))) ? null : parseFloat(item[index.change].replace(/\+|\s+|%/g, ''))
		};
	});
}

async function archiveIteration(url, coinList) {
	let table = (await scraper.scrapePage(url))[2].slice(1);
	let html = await (await fetch(url)).text();
	let pTags = $('p', html).toArray().map(item => $(item).text());
	let date = pTags[pTags.length-1].replace('Last updated:', '');
	date = new Date(date);
	
	table = formatTable(table, date, coinList);
	
	// TODO save to Postgres
	return table.length;
}

async function recursivelyRun(timeline, index, coinList, totalRows) {
	let currentArchive = timeline[index];
	if(!currentArchive)
		return totalRows;
	
	console.log(`Scraping Archive from ${new Date(currentArchive.time).toUTCString()}`);
	let rowsAdded = await archiveIteration(currentArchive.url, coinList);
	totalRows += rowsAdded;
	console.log(`Rows Added: ${rowsAdded}\nTotal Rows: ${totalRows}\n------------------------`)
	return await recursivelyRun(timeline, index+1, coinList, totalRows);
}

async function scrapeAllArchives() {
	const url = 'http://coinmarketcap.com';
	let timeline = await getTimeline(url);
	let coinList = await fs.readFile('../combos.json');
	coinList = JSON.parse(coinList).map(combo => combo.fsym);
	
	let totalRows = await recursivelyRun(timeline, timeline.length-1, coinList, 0);
	console.log(`FINISHED getting CoinMarketCap Archive!\nTotal Rows Added: ${totalRows}`);
}

scrapeAllArchives().then();
