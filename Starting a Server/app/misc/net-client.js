/*
 * Example TCP (Net) Client
* Connects to port 6000 and sends the word "ping" to the server
*/

// Dependencies
const net = require('net');

// Define the messsage to send
const outboundMessage = 'ping';

// Crette the client
const client = net.createConnection({port : 6000},function(){
    // Send hhe message
    client.write(outboundMessage);
});

// When the server writes back, log what it says then kill the client
client.on('data',function(inboundMesssage){
    const messageString = inboundMesssage.toString();
    console.log("I wrote "+outboundMessage+" and they said "+messageString);
    client.end();
})