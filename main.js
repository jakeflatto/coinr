const fillHistory = require('./fillHistory');
const fs = require('fs');

// Fills out all combinations
let combinations = [];
// TODO make promise
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
function recursivelyRun(combo, index) {
	return new Promise((resolve, reject) => {
		if(!combo)
			resolve(true);
		else {
			console.log(`${index+1}/${combo.length}`);
			console.log(`${combo.exchange}-${combo.tsym}-${combo.fsym}`);
			fillHistory(combo.fsym, combo.tsym, combo.exchange).then(rowCount => {
				totalRows += rowCount;
				console.log(`Rows Added: ${rowCount}`);
				console.log(`Running Total: ${totalRows}`);
				console.log('------------------');
				recursivelyRun(combo, index+1).then(() => {
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
combinations.then(combo => {
	console.log(combo);
	// recursivelyRun(combo, 0).then(() => {
	// 	console.log('COMPLETELY FINISHED!!');
	// 	console.log(`Total Rows: ${totalRows}`);
	// 	process.exit();
	// }).catch(err => {
	// 	console.log(err);
	// 	process.exit();
	// });
});
// Now we're here


