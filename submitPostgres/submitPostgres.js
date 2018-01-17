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

async function submitPostgres(table, valueList) {
	let formattedValues = valueList.map(obj => formatValue(obj));
	let query = formatQuery(formattedValues, table);
	
	await client.query(query);
};

module.exports = submitPostgres;

// Helper functions

function formatQuery(values, table) {
	if(!values || !table)
		throw Error('formatQuery() is missing required parameters.');
	return `INSERT INTO ${table} VALUES ${values.join(',')};`;
}

function formatValue(values) {
	// TODO make generic by iterating through keys, and adding timestamp if Date
	return `(TIMESTAMP '${new Date(values.hour_marker).toISOString().replace('T',' ').replace('Z','')}',
	'${values.traded_with}',
	'${values.traded_for}',
	'${values.exchange}',
	${values.open},
	${values.high},
	${values.low},
	${values.close},
	${values.volume_traded_with},
	${values.volume_traded_for})`.replace(/\s+/g, ' ');
};
