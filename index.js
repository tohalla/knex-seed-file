const fs = require('fs');
const Promise = require('bluebird');

module.exports = function(knex, path, tableName, options) {
  return new Promise(function(resolve, reject) {
    options = Object.assign({
      columnSeparator: '\t',
      rowSeparator: '\n',
      encoding: 'utf8',
      ignoreFirstLine: false,
      useFirstLineForColumns: true,
      handleInsert: function(inserts, tableName) {
        return knex(tableName).insert(inserts);
      },
    }, options);

    let mapTo = options.mapTo;
    if (mapTo) {
      options.useFirstLineForColumns = false;
    }

    if (
      typeof path === 'undefined' ||
      typeof tableName === 'undefined' ||
      (typeof options.mapTo === 'undefined' && !options.useFirstLineForColumns)
    ) {
      reject(Error('path, tableName and mapTo needs to be defined'));
    }

    const stream = fs.createReadStream(path).setEncoding(options.encoding);

    let splitEnd = '';

    const inserts = [];

    stream.on('data', function(chunk) {
      const tempRows = chunk.split(options.rowSeparator);
      if (splitEnd.length > 0) {
        tempRows[0] = splitEnd + tempRows[0];
        splitEnd = '';
      }
      if (!tempRows[tempRows.length-1].endsWith(options.rowSeparator)) {
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
        const cols = row.split(options.columnSeparator);
        const knexRow = {};
        mapTo.map(function(key, index) {
          if (key === null) {
            return;
          }
          try {
            knexRow[key] = cols[index] ? JSON.parse(cols[index]) : null;
          } catch (e) {
            knexRow[key] = cols[index];
          }
        });
        inserts.push(knexRow);
      });
    });

    stream.on('end', function() {
      options.handleInsert(inserts, tableName)
          .then(resolve);
    });
  });
};
