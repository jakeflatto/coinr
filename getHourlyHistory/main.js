const fillHistory = require('./fillHistory');
const fs = require('fs');

// Fills out all combinations
let combinations = [];
combinations = new Promise((resolve, reject) => {
	fs.readFile('./combos.json', (err, data) => {
		if(err)
			reject(err);
		else
			resolve(JSON.parse(data));
	});
});

let totalRows = 0;

// Recursively run through every combination
function recursivelyRun(combos, index) {
	return new Promise((resolve, reject) => {
		let combo = combos[index];
		if(!combo)
			resolve(true);
		else {
			console.log(`${index+1}/${combos.length}`);
			console.log(`${combo.exchange}-${combo.tsym}-${combo.fsym}`);
			fillHistory(combo.fsym, combo.tsym, combo.exchange).then(rowCount => {
				totalRows += rowCount;
				console.log(`Rows Added: ${rowCount}`);
				console.log(`Running Total: ${totalRows}`);
				console.log('------------------');
				recursivelyRun(combos, index+1).then(() => {
					resolve(true);
				}).catch(err => {
					reject(err);
				});
			}).catch(err => {
				reject(err);
			});
		}
	});
}

// Started from the bottom
combinations.then(combos => {
	recursivelyRun(combos, 0).then(() => {
		console.log('COMPLETELY FINISHED!!');
		console.log(`Total Rows: ${totalRows}`);
		process.exit();
	}).catch(err => {
		console.log(err);
		process.exit();
	});
});
// Now we're here


