let fs = require('fs');

let jokes = {};

jokes.allJokes = function(){

    let fileContents = fs.readFileSync(__dirname+'/jokes.txt', 'utf8');

    let arrayOfJokes = fileContents.split(/\r?\n/);

    return arrayOfJokes;
}

module.exports = jokes;