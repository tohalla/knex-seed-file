# knex-seed-file
A tool that makes using seed files easier with [knex](https://github.com/tgriesser/knex)

## Installation
```
npm install --save-dev knex-seed-file
```
## Usage
In this we'll use [csv file](example/fruits.csv) generated with excel:

![fruits](https://github.com/tohalla/knex-seed-file/blob/master/example/fruits-excel.png?raw=true)

We want to ignore ascii value for color and use only columns 'id', 'name' and 'hexColor'

```
seedFile(knex, path, tableName, mapTo, options)
```

```javascript
const path = require('path');

const seedFile = require('knex-seed-file');

exports.seed = function(knex, Promise) {
  return Promise.join(
    knex('locations').del(),
    seedFile(knex, path.resolve('./fruits.csv'), 'fruits', [
      'id',
      'name',
      null,
      'hexColor'
    ], {
      columnSeparator: ';',
      ignoreFirstLine: true
    })
  );
};
```
## Attributes
####knex
Knex instance
####path
Absolute file location
####tableName
Table, where rows will be added
####mapTo
Will define where files columns(from left to right) will be mapped in the table
####options
#####columnSeparator
*defaults to \t*
#####rowSeparator
*defaults to \n*
#####encoding
*defaults to utf8*
#####ignoreFirstLine
*defaults to false*
