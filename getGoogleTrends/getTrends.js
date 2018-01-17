const Trends = require('google-trends-api');
const fs = require('fs-extra');
const moment = require('moment');

// TODO look up more on Google Correlate
const keywords = [
	'bitcoin',
	'cryptocurrency',
	'altcoins',
	'blockchain'
];

const startTime = new Date('2013-01-01').getTime();
const currentTime = moment(new Date()).startOf('day'); // Moment object
// TODO recursively iterate from currentTime to startTime
// currentTime.subtract({ days: 90 })

async function iterateDailyInterval() {
	let data = await Trends.interestOverTime({
		keyword: 'bitcoin',
		startTime: new Date('2014-12-20'),
		endTime: new Date('2015-01-01'),
		granularTimeResolution: true
	});
	await fs.writeFile('./output.json', data);
}

async function iterateHourlyInterval {
	// Only available for last week
}