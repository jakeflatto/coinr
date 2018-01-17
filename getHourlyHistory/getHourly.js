const fillHistory = require('./fillHistory');
const fs = require('fs-extra');
const pg = require('pg');
const client = new pg.Client({
	user: 'postgres',
	host: 'localhost',
	// host: '10.0.1.2',
	database: 'coinr',
	password: process.env.POSTGRES,
	port: 5432
});
// client.connect();

let totalRows = 0;

// Recursively run through every combination
async function recursiveIteration(combos, index) {
	const startTimestamp = new Date('Mon, 01 Jan 2018 00:00:00 GMT').getTime();
	let combo = combos[index];
	if(!combo)
		return true;
	
	console.log(`${index+1}/${combos.length}\n${combo.exchange}-${combo.tsym}-${combo.fsym}`);
	let rowCount = await fillHistory(combo.fsym, combo.tsym, startTimestamp, combo.exchange, 0, client);
	totalRows += rowCount;
	console.log(`Rows Added: ${rowCount}\nRunning Total: ${totalRows}\n------------------`);
	return recursiveIteration(combos, index+1)
}

// Run through all combos
async function recursivelyRun() {
	let combinations = JSON.parse(await fs.readFile('./combos.json'));
	await recursiveIteration(combinations, 0);
}

// Actually execute
recursivelyRun().then(() => {
	console.log(`FINISHED HOURLY HISTORY!!\nTotal Rows: ${totalRows}`);
	client.end();
	process.exit();
}).catch(err => {
	console.log(err);
	client.end();
	process.exit();
});

