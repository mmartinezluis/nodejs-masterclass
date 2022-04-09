/*
 * Primary file for the API
 *
 */

// Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');

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
};

// Execute
app.init();

// Export the app
module.exports = app;