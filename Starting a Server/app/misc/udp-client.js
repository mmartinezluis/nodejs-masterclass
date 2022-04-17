/*
 * Exampple UDP client
 * Sending a message to a UDP server on port 6000
 */

// Dependencies
const dgram = require('dgram');

// Create the client
const client = dgram.createSocket('udp4');

// Deine the message and pull it into a bugger
const messageString = 'This is a message';
const messageBuffer = Buffer.from(messageString);

// Send off the message
client.send(messageBuffer,6000,'localhost',function(err){
    client.close();
});


