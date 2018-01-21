const tableToJson = require('tabletojson');

// Gets largest table & removes heading
function scrapeTable(url) {
	return new Promise((resolve, reject) => {
		try {
			tableToJson.convertUrl(url, { useFirstRowForHeadings: true },
			(tablesAsJson) => resolve(tablesAsJson.sort((a, b) => b.length -a.length)[0].slice(1)));
		} catch(err) {
			reject(err);
		}
	});
};

// Gets all tables, unchanged
function scrapePage(url) {
	return new Promise((resolve, reject) => {
		try {
			tableToJson.convertUrl(url, { useFirstRowForHeadings: true },
				(tablesAsJson) => resolve(tablesAsJson));
		} catch(err) {
			reject(err);
		}
	});
};

module.exports = {
	scrapeTable,
	scrapePage
};