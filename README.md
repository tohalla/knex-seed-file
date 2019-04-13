# knex-seed-file
A tool that makes using seed files easier with [knex](https://github.com/tgriesser/knex)

## Installation
```
npm install --save-dev knex-seed-file
```
## Usage
Here we'll use [csv file](example/fruits.csv) created using excel:

![fruits](https://github.com/tohalla/knex-seed-file/blob/master/example/fruits-excel.png?raw=true)

We want to ignore ascii value for color and use only columns 'id', 'name' and 'hexColor'

```javascript
const path = require('path');

const seedFile = require('knex-seed-file');

exports.seed = function(knex, Promise) {
  knex('fruits').del()
    .then(() => seedFile(knex, path.resolve('./fruits.csv'), 'fruits',
    {
      columnSeparator: ';',
      ignoreFirstLine: true,
      mapTo: ['id', 'name', null, 'hexColor']
    }));
};
```

## Properties

```
seedFile(knex, path, tableName, mapTo, options)
```

| Property  | Description                                            | Default value                  | Required |
|-----------|--------------------------------------------------------|--------------------------------|----------|
| knex      | Knex instance                                          | undefined                      | yes      |
| path      | Absolute path to file containing values to be inserted | undefined                      | yes      |
| tableName | Corresponding table name in the database               | undefined                      | yes      |

### Options

| Property               | Description                                                                          | Default value |
|------------------------|--------------------------------------------------------------------------------------|---------------|
| mapTo                  | Defines where columns in the file will be mapped in the table                        | undefined     |
| columnSeparator        |                                                                                      | \t            |
| rowSeparator           |                                                                                      | \n            |
| encoding               |                                                                                      | utf8          |
| ignoreFirstLine        |                                                                                      | false         |
| useFirstLineForColumns | Defines, whether first line in the file will be used when mapping data to the table. | true          |

If you use mapTo array, useFirstLineForColumns will be set false. However, if the first row still contains labels for the data, you need to set ignoreFirstLine to true.
