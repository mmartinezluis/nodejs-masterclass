let mathLib = require('./lib/math');
let jokesLib = require('./lib/jokes');

let app = {};

app.config = {
    'timeBetweenJokes' : 1000
}

app.printAJoke = function(){

    let allJokes = jokesLib.allJokes();

    let numberOfJokes = allJokes.length;

    let randomNumber = mathLib.getRandomNumber(1,numberOfJokes);

    let selectedJoke = allJokes[randomNumber-1];

    console.log(selectedJoke);
}

app.infiniteLoop = function(){

    setInterval(app.printAJoke, app.config.timeBetweenJokes);
}

app.infiniteLoop();