/*
 * Example HTTP2 Client
 */

// Dependencies
const http2 = require('http2');

// Create client
const client = http2.connect("http://localhost:6000");

// Create a reuqest
const req = client.request({
    ':path' : '/'
});

// When a message is recieved, add the pieces of it together until you reach the end
req.on('data',function(chunk){
    str+=chunk;
});
  
let str = '';
// When the message ends, lgo it out
req.on('end',function(){
    console.log(str);
});

// End the request
req.end();