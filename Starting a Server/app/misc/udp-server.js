/*
 * Example UDP Server
 * Creating a UDP datagram server listenting on 6000
 * 
 */

// Dependencies
const dgram = require('dgram');

// Create a server
const server = dgram.createSocket('udp4');

server.on('message',function(messageBuffer,sender){
    // Do something with the incoming message ro do something with the sender
    let messageString = messageBuffer.toString();
    console.log(messageString);

})

// Bdin to 6000
server.bind(6000);
