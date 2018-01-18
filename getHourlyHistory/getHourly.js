const fillHistory = require('./fillHistory');
const fs = require('fs-extra');
const moment = require('moment');
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

// Recursively run through every combination
async function iterateCombo(combos, index, totalRows, table) {
	let combo = combos[index];
	if(!combo)
		return totalRows;
	const startTimestamp = moment(new Date()).startOf('hour').valueOf();
	let endTimestamp = await client.query(`SELECT MAX(hour_marker) FROM ${table} WHERE traded_with='${combo.tsym}' AND traded_for='${combo.fsym}' AND exchange='${combo.exchange}';`);
	endTimestamp = endTimestamp.rows[0].max;
	endTimestamp = new Date(endTimestamp).getTime();
	
	console.log(`${index+1}/${combos.length}\n${combo.exchange}-${combo.tsym}-${combo.fsym}`);
	let rowCount = await fillHistory(combo.fsym, combo.tsym, startTimestamp, endTimestamp, combo.exchange, 0, client, table);
	totalRows += rowCount;
	console.log(`Rows Added: ${rowCount}\nRunning Total: ${totalRows}\n------------------`);
	
	return await iterateCombo(combos, index+1, totalRows, table)
}

// Provides list of combinations to run through
async function recursivelyRun(table) {
	let combinations = JSON.parse(await fs.readFile('./combos.json'));
	return await iterateCombo(combinations, 0, 0, table);
}

// Actually execute
recursivelyRun('price_histories_hourly').then(totalRows => {
	console.log(`FINISHED HOURLY HISTORY!!\nTotal Rows: ${totalRows}`);
	client.end();
	process.exit();
}).catch(err => {
	console.log(err);
	client.end();
	process.exit();
});

