const json = require('./v8raw.json');
//save array to local file as a json
const fs = require('fs');
fs.writeFile('v8.json', JSON.stringify(json), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log('The file was saved!');
});