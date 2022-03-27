const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

let server = http.createServer(function(req, res){

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
            'payload' : buffer
        }

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use the payload call back by the handler, or default ot an empty object
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
})


server.listen(3000, function(){
    console.log("The sever is listening on port 3000 now")
})

// Define handlers
let handlers = {};

handlers.sample = function(data, callback){
    callback(406,{'name' : 'sample handler'});
};

handlers.notFound = function(data, callback){
    callback(404);
};

// Request Router
let router = {
    'sample' : handlers.sample
};