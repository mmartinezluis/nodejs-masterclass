/*
 * Primary file for the API
 *
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// To see logs related to HTTP, start the app with thsi command:
        // NODE_DEBUG=http node index.js

// Declare the app
const app = {};

// Init function
app.init = function(){
    // Start the server
    server.init();

    // Start the workers
    // workers.init();

    // Start the CLI, but make sure it starts last
    setTimeout(function(){
        cli.init();
    },50)
};

// Execute
app.init();

// Export the app
module.exports = app;