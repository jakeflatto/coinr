const waybackAPI = require('wayback-machine');

function getTimeline(url) {
	return new Promise((resolve, reject) => {
		waybackAPI.getTimeline(url, (err, timeline) => {
			if(!err)
				resolve(timeline);
			reject(err);
		});
	});
}

getTimeline('http://coinmarketcap.com').then(res => console.log(res));