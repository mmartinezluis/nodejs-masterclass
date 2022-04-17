/*
 * Example TLS Client
* Connects to port 6000 and sends the word "ping" to the server
*/


// Dependencies
const tls = require('tls');
const fs = require('fs');
const path = require('path');


// Server options
const options = {
    'ca' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem')) // Only required because we are suing a self signed certificate
};

// Define the messsage to send
const outboundMessage = 'ping';

// Crette the client
const client = tls.connect(6000,options,function(){
    // Send hhe message
    client.write(outboundMessage);
});

// When the server writes back, log what it says then kill the client
client.on('data',function(inboundMesssage){
    const messageString = inboundMesssage.toString();
    console.log("I wrote "+outboundMessage+" and they said "+messageString);
    client.end();
})