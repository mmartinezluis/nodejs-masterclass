/*
 * Example TLS Server
 * Listens for port 6000 and sends the word 'pong' to client
 */

// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');

// Server options
const options = {
    'key' : fs.readFileSync( path.join(__dirname,'/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

// Cretae the server
const server = tls.createServer(options,function(connection){
    // Send the word "pong"
    const outboundMessage = 'pong';
    connection.write(outboundMessage);

    // When the client writes something, lgo it out
    connection.on('data',function(inboundMesssage){
        let messageString = inboundMesssage.toString();
        console.log("I wrote "+outboundMessage+" and they said "+messageString);
    });
});

server.listen(6000);