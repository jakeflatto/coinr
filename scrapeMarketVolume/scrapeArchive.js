const scraper = require('../scrapeMarketData/scraper');
const fetch = require('node-fetch');
const $ = require('cheerio');
const fs = require('fs-extra');
const archiveHelper = require('./helpers');
const submitPostgres = require('../submitPostgres/submitPostgres');
const pg = require('pg');
const client = new pg.Client({
	user: 'postgres',
	host: 'localhost',
	// host: '10.0.1.2',
	database: 'coinr',
	password: process.env.POSTGRES,
	port: 5432
});
client.connect();

async function archiveIteration(url, coinList) {
	let table = (await scraper.scrapePage(url))[2].slice(1);
	let html = await (await fetch(url)).text();
	let pTags = $('p', html).toArray().map(item => $(item).text());
	let date = pTags[pTags.length-1].replace('Last updated:', '');
	date = new Date(date);
	
	table = archiveHelper.formatTable(table, date, coinList);
	await submitPostgres(client, 'coinmarketcap_histories', table);
	
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
	let timeline = await archiveHelper.getTimeline(url);
	let coinList = await fs.readFile('./combos.json');
	coinList = JSON.parse(coinList).map(combo => combo.fsym);
	
	return await recursivelyRun(timeline, 0, coinList, 0);
}

scrapeAllArchives().then(totalRows => {
	console.log(`FINISHED getting CoinMarketCap Archive!\nTotal Rows Added: ${totalRows}`);
	process.exit();
}).catch(err => {
	console.log(err);
	process.exit();
});