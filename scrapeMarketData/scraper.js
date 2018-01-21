const tableToJson = require('tabletojson');

function scrapeTable(url) {
	return new Promise((resolve, reject) => {
		try {
			tableToJson.convertUrl(url, { useFirstRowForHeadings: true },
			(tablesAsJson) => resolve(tablesAsJson[0].slice(1)));
		} catch(err) {
			reject(err);
		}
	});
};

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