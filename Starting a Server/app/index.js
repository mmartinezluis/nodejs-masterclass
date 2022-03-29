const http = require('http');
const https = require('https')
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./lib/config');
const fs = require('fs');
const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');


// TESTING
// @tTODO delete this
// _data.create('test','newFile',{'foo': 'bar'}, function(err){
//     console.log('this was the error', err)
// });

// _data.read('test','newFile', function(err,data){
//     console.log('this was the error', err, 'and this was the data ',data);
// });

// _data.update('test','newFile',{'fizz' : 'blizz'}, function(err){
//     console.log('this was the error',err);
// })

// _data.delete('test','newFile',function(err){
//     console.log('this was the error',err);
// })

// Instantiate the HTTP server
let httpServer = http.createServer(function(req, res){
    unifiedServer(req,res);
})

// Start the HTTP server
httpServer.listen(config.httpPort, function(){
    console.log("The sever is listening on port "+config.httpPort)
})

// Instantiate the HTTPS server
const httpsServerOptions = {
    'key' : fs.readFileSync(__dirname + '/https/key.pem'),
    'cert' : fs.readFileSync(__dirname + '/https/cert.pem')
}
let httpsServer = https.createServer(httpsServerOptions, function(req, res){
    unifiedServer(req,res);
})

// Start the HTTPS server
httpsServer.listen(config.httpsPort, function(){
    console.log("The server is listening on port "+config.httpsPort)
})

let unifiedServer = function(req,res){

    const parsedUrl = url.parse(req.url, true);

    const path = parsedUrl.pathname;

    const trimmedPath = path.replace(/^\/+|\/+$/g,'');

    const queryStringObject = parsedUrl.query;

    const method = req.method.toLowerCase();

    const headers = req.headers;    

    // Get the payload
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data){
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        // Chosse the handler the request should go to; if one is not found is the not found handler
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // Contruct data object to send to handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        }
        
        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString)
            console.log('Returning this response: ',statusCode, payloadString);  
        })
        // console.log('Reqeust received with this payload: ', buffer);  
    })
    // console.log('Request received on path: '+trimmedPath+ ' with method: '+method+' and with this query string parameters', queryStringObject);
    // console.log('Reqeust received with these headers: ', headers);
}




// Request Router
let router = {
    'ping' : handlers.ping,
    'users': handlers.users,
    'sample' : handlers.sample,
    'tokens' : handlers.tokens
};