var fs = require('fs');
var Promise = require('bluebird');

module.exports = function(knex, path, tableName, mapTo, options) {
	return new Promise(function(resolve, reject) {
		if(
			typeof path === 'undefined' ||
			typeof tableName === 'undefined' ||
			typeof mapTo === 'undefined' ||
			(typeof mapTo === 'object' && !mapTo.useFirstLineForColumns)
		) {
			reject('path, tableName and mapTo needs to be defined');
		}
		if (typeof mapTo === 'object') {
			options = mapTo;
			mapTo = [];
		}
		options = typeof options !== 'undefined' ? Object.assign({}, options) : {};
		options.columnSeparator = typeof options.columnSeparator === 'string' ?
			options.columnSeparator : '\t';
		options.rowSeparator = typeof options.rowSeparator === 'string' ?
			options.rowSeparator : '\n';
		options.encoding = typeof options.encoding === 'string' ?
			options.encoding : 'utf8';
		options.ignoreFirstLine = typeof options.ignoreFirstLine === 'boolean' ?
			options.ignoreFirstLine : false;
		options.useFirstLineForColumns = typeof options.useFirstLineForColumns === 'boolean' ?
			options.useFirstLineForColumns : false;
		options.handleInsert = typeof options.handleInsert === 'function' ?
			options.handleInsert : function(inserts, tableName) {
				return knex(tableName)
					.insert(inserts);
			};

		var stream = fs.createReadStream(path);
		stream.setEncoding(options.encoding);

		var splitEnd = '';

		var inserts = [];

		stream.on('data', function(chunk) {
			var tempRows = chunk.split(options.rowSeparator);
			if (splitEnd.length > 0) {
				tempRows[0] = splitEnd + tempRows[0];
				splitEnd = '';
			}
			if (!tempRows[tempRows.length-1].endsWith(options.rowSeparator)){
				splitEnd = tempRows.pop();
			}
			if (options.ignoreFirstLine || options.useFirstLineForColumns) {
				if (options.useFirstLineForColumns) {
					mapTo = tempRows.shift().split(options.columnSeparator);
				} else {
					tempRows.shift();
				}
				options.ignoreFirstLine = false;
				options.useFirstLineForColumns = false;
			}

			tempRows.map(function(row) {
				var cols = row.split(options.columnSeparator);
				var knexRow = {};
				mapTo.map(function(key, index) {
					if (key === null) {
						return;
					}
					try {
						knexRow[key] = cols[index] ? JSON.parse(cols[index]) : null;
					} catch(e) {
						knexRow[key] = cols[index];
					}
				});
				inserts.push(knexRow);
			});
		});

		stream.on('end', function() {
			Promise.resolve(options.handleInsert(inserts, tableName))
				.then(resolve('all rows inserted'));
		});
	});
}
