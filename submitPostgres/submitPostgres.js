// Parent importing this file is responsible for opening connection and passing down client

function formatQuery(rows, table) {
	let formattedValues = rows.map(row => {
		return `(${row.map(value => {
			if(value instanceof Date)
				return `TIMESTAMP '${value.toISOString()}'`;
			return `'${value}'`;
		}).join(',')})`;
	});
	return `INSERT INTO ${table} VALUES ${formattedValues.join(',')};`;
}

async function submitPostgres(client, table, rows) {
	let query = formatQuery(rows, table);
	
	await client.query(query);
};

module.exports = submitPostgres;