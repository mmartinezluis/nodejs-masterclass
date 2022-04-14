/*
 * Primary file for the API
 *
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');
let exampleDebuggingProblem = require('./lib/exampleDebuggingProblem');

// To see logs related to HTTP, start the app with thsi command:
        // NODE_DEBUG=http node index.js



// ********************** TO USE THE DEBBUGER, START THE APP USING:

//              node inpsect {index.js  || initialization file}

//                   ****************************************************    


// ********************** TO USE REPL TO EXAMINE THE CODE A ANY GIVEN DEBUGGIN POINT, USE:

//                                      repl

//                    ****************************************************                                                            


// Declare the app
const app = {};

// Init function
app.init = function(){

    debugger;
    // Start the server
    server.init();
    debugger;

    // Start the workers
    // workers.init();

    debugger;
    // Start the CLI, but make sure it starts last
    setTimeout(function(){
        cli.init();
        debugger;
    },50);
    debugger;

    debugger;
    // Set foo to 1
    let foo = 1;
    console.log('Just assigned 1 to foo')
    debugger;

    foo++;
    console.log('Just incremented foo');
    debugger;

    foo = foo * foo;
    console.log("just squared foo");
    debugger;

    foo = foo.toString();
    console.log('JUust converted foo to string')
    debugger;

    // Call the init script that will throw
    exampleDebuggingProblem.init();
    console.log('just called the library');
    debugger;
};

// Execute
app.init();

// Export the app
module.exports = app;