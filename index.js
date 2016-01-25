var fs = require('fs');
var Promise = require('bluebird');

module.exports = function(knex, path, tableName, mapTo, options) {
  return new Promise(function(resolve, reject) {
    if(
      typeof path === 'undefined' ||
      tableName === 'undefined' ||
      mapTo === 'undefined'
    ) {
      reject('path, tableName and mapTo needs to be defined');
    }
    options = typeof options !== 'undefined' ? options : {};
    options.columnSeparator = typeof options.columnSeparator !== 'undefined' ?
      options.columnSeparator : '\t';
    options.rowSeparator = typeof options.rowSeparator !== 'undefined' ?
      options.rowSeparator : '\n';
    options.encoding = typeof options.encoding !== 'undefined' ?
      options.encoding : 'utf8';

    var stream = fs.createReadStream(path);
    stream.setEncoding(options.encoding);

    var splitEnd = '';

    var inserts = [];

    stream.on('data', function(chunk) {
      var tempRows = chunk.split(options.rowSeparator);
      if(splitEnd.length > 0) {
        tempRows[0] = splitEnd + tempRows[0];
        splitEnd = '';
      }
      if(!tempRows[tempRows.length-1].endsWith(options.rowSeparator)){
        splitEnd = tempRows.pop();
      }

      tempRows.map(function(row) {
        var cols = row.split(options.columnSeparator);
        var knexRow = {};
        mapTo.map(function(key, index) {
          if(key === null) {
            return;
          }
          knexRow[key] = cols[index];
        });
        inserts.push(knex(tableName).insert(knexRow));
      });
    })

    stream.on('end', function() {
      return Promise.all(inserts).then(resolve('all rows inserted'));
    });
  });
}
