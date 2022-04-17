/*
 * Example TCP (Net) Server
 * Listens for port 6000 and sends the word 'pong' to client
 */

// Dependencies
const net = require('net');

// Cretae the server
const server = net.createServer(function(connection){
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