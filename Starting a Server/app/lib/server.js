/*
 * Server-related tasks
 *
 */

const http = require('http');
const https = require('https')
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');
const util = require('util');
const debug = util.debug('server');

// Start the app with this command to render logs for server: 'NODE_DEBUG=server node index.js'

// Instantiate the server module object
const server = {};

//  @TODO GET RID OF THIS
// helpers.sendTwilioSms('4158375309',"Hello",function(err){
//     console.log('this was the error',err);
// });


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
server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req,res);
})

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key' : fs.readFileSync( path.join(__dirname,'/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};
server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
    server.unifiedServer(req,res);
});


server.unifiedServer = function(req,res){

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
        const chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Contruct data object to send to handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        }
        
        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload,contentType){

            // Determinte the type of response f(fallback to JSON)
            contentType = typeof(contentType) == 'string' ? contentType : 'json';

            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Return the response-parts that are content-specific
            let payloadString = '';
            if(contentType == 'json'){
                res.setHeader('Content-Type','application/json');
                payload = typeof(payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            }
            if(contentType == 'html'){
                res.setHeader('Content-Type','text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';
            }


            // Return the response-parts that are common to all content-type
            res.writeHead(statusCode);
            res.end(payloadString);

       
            // If the response is 200, print green; otherwise print red
            if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);  
            } else {
                debug('\x1b[31m%s\x1b[0m',method.toUpperCase()+' /'+trimmedPath+' '+statusCode);  
            }
            // console.log('Returning this response: ',statusCode, payloadString);  
        });
        // console.log('Reqeust received with this payload: ', buffer);  
    });
    // console.log('Request received on path: '+trimmedPath+ ' with method: '+method+' and with this query string parameters', queryStringObject);
    // console.log('Reqeust received with these headers: ', headers);
};




// Request Router
server.router = {
    '' : handlers.index,
    'account/create' : handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/deleted' : handlers.accountDeleted,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDeleted,
    'checks/all' : handlers.checkList,
    'checks/create' : handlers.checksCreate,
    'checks/edit' : handlers.checksEdit,
    'ping' : handlers.ping,
    'api/users': handlers.users,
    'api/tokens' : handlers.tokens,
    'api/checks' : handlers.checks,
    'sample' : handlers.sample,
};

// Init script
server.init = function(){
    // Start the HTTP server
    server.httpServer.listen(config.httpPort, function(){
        // console.log("The sever is listening on port "+config.httpPort)
        console.log('\x1b[36m%s\x1b[0m',"The sever is listening on port "+config.httpPort);
    });

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function(){
        // console.log("The server is listening on port "+config.httpsPort) 
        console.log('\x1b[35m%s\x1b[0m',"The sever is listening on port "+config.httpsPort);
    });
   
};


// Export the server
module.exports = server;